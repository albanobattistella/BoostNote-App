import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { getColorFromString } from '../../lib/utils/string'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../interfaces/db/doc'
import { useSettings, CodeMirrorKeyMap } from '../../lib/stores/settings'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import attachFileHandlerToCodeMirrorEditor, {
  OnFileCallback,
} from '../../lib/editor/plugins/fileHandler'
import { uploadFile, buildTeamFileUrl } from '../../api/teams/files'
import {
  createRelativePositionFromTypeIndex,
  createAbsolutePositionFromRelativePosition,
} from 'yjs'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../lib/keyboard'
import { SerializedTeam } from '../../interfaces/db/team'
import { isEditSessionSaveShortcut } from '../../lib/shortcuts'
import { getDocTitle } from '../../lib/utils/patterns'
import { SerializedUser } from '../../interfaces/db/user'
import EditorToolbar from './EditorToolbar'
import { usePreferences } from '../../lib/stores/preferences'
import { useRouter } from '../../lib/router'
import {
  pasteFormatPlugin,
  PositionRange,
  Callback,
} from '../../lib/editor/plugins/pasteFormatPlugin'
import { buildIconUrl } from '../../api/files'
import { SerializedRevision } from '../../interfaces/db/revision'
import EditorTemplateButton from './EditorTemplateButton'
import {
  mdiRepeat,
  mdiRepeatOff,
  mdiFileDocumentOutline,
  mdiStar,
  mdiStarOutline,
  mdiPencil,
  mdiEyeOutline,
  mdiViewSplitVertical,
  mdiCommentTextOutline,
  mdiDotsHorizontal,
} from '@mdi/js'
import EditorToolButton from './EditorToolButton'
import { not } from 'ramda'
import EditorToolbarUpload from './EditorToolbarUpload'
import { useNav } from '../../lib/stores/nav'
import { Hint } from 'codemirror'
import { SerializedTemplate } from '../../interfaces/db/template'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import EditorSelectionStatus from './EditorSelectionStatus'
import EditorIndentationStatus from './EditorIndentationStatus'
import EditorKeyMapSelect from './EditorKeyMapSelect'
import EditorThemeSelect from './EditorThemeSelect'
import DocContextMenu from '../DocPage/NewDocContextMenu'
import {
  focusEditorEventEmitter,
  toggleSplitEditModeEventEmitter,
  togglePreviewModeEventEmitter,
  focusEditorHeadingEventEmitter,
} from '../../lib/utils/events'
import { ScrollSync, scrollSyncer } from '../../lib/editor/scrollSync'
import CodeMirrorEditor from '../../lib/editor/components/CodeMirrorEditor'
import MarkdownView, { SelectionContext } from '../MarkdownView'
import { usePage } from '../../lib/stores/pageStore'
import { useToast } from '../../../design/lib/stores/toast'
import { LoadingButton } from '../../../design/components/atoms/Button'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useModal } from '../../../design/lib/stores/modal'
import PresenceIcons from '../Topbar/PresenceIcons'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import CommentManager from '../Comments/CommentManager'
import useCommentManagerState from '../../lib/hooks/useCommentManagerState'
import { HighlightRange } from '../../lib/rehypeHighlight'
import { getDocLinkHref } from '../Link/DocLink'
import throttle from 'lodash.throttle'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { parse } from 'querystring'
import DocShare from '../DocPage/DocShare'
import EditorLayout from '../DocPage/EditorLayout'
import PreferencesContextMenuWrapper from '../PreferencesContextMenuWrapper'
import InviteCTAButton from '../buttons/InviteCTAButton'
import { BaseTheme } from '../../../design/lib/styled/types'
import Spinner from '../../../design/components/atoms/Spinner'
import styled from '../../../design/lib/styled'
import { rightSidePageLayout } from '../../../design/lib/styled/styleFunctions'
import Icon from '../../../design/components/atoms/Icon'
import ApplicationTopbar from '../ApplicationTopbar'
import ApplicationPage from '../ApplicationPage'
import ApplicationContent from '../ApplicationContent'

type LayoutMode = 'split' | 'preview' | 'editor'

interface EditorProps {
  doc: SerializedDocWithBookmark
  team: SerializedTeam
  user: SerializedUser
  revisionHistory: SerializedRevision[]
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  docIsEditable?: boolean
}

interface EditorPosition {
  line: number
  ch: number
}

interface SelectionState {
  currentCursor: EditorPosition
  currentSelections: {
    head: EditorPosition
    anchor: EditorPosition
  }[]
}

const Editor = ({
  doc,
  team,
  user,
  contributors,
  backLinks,
  docIsEditable,
}: EditorProps) => {
  const { translate } = useI18n()
  const {
    currentUserPermissions,
    permissions,
    currentUserIsCoreMember,
  } = usePage()
  const showViewPageRef = useRef<boolean>(
    !docIsEditable || !currentUserIsCoreMember
  )
  const { pushMessage, pushApiErrorMessage } = useToast()
  const [color] = useState(() => getColorFromString(user.id))
  const { preferences, setPreferences } = usePreferences()
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const fileUploadHandlerRef = useRef<OnFileCallback>()
  const [editorLayout, setEditorLayout] = useState<LayoutMode>(
    !docIsEditable || !currentUserIsCoreMember
      ? 'preview'
      : preferences.lastEditorMode != 'preview'
      ? preferences.lastEditorEditLayout
      : 'preview'
  )
  const [editorContent, setEditorContent] = useState('')
  const docRef = useRef<string>('')
  const router = useRouter()
  const { state } = router
  const [shortcodeConvertMenu, setShortcodeConvertMenu] = useState<{
    pos: PositionRange
    cb: Callback
  } | null>(null)
  const initialRenderDone = useRef(false)
  const { docsMap, workspacesMap, loadDoc } = useNav()
  const suggestionsRef = useRef<Hint[]>([])
  const { sendingMap, toggleDocBookmark } = useCloudApi()
  const mountedRef = useRef(false)

  const [selection, setSelection] = useState<SelectionState>({
    currentCursor: {
      line: 0,
      ch: 0,
    },
    currentSelections: [
      {
        head: {
          line: 0,
          ch: 0,
        },
        anchor: {
          line: 0,
          ch: 0,
        },
      },
    ],
  })

  const userInfo = useMemo(() => {
    return {
      id: user.id,
      name: user.displayName,
      color: color,
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user, color])

  const [realtime, connState, connectedUsers] = useRealtime({
    token: doc.collaborationToken || doc.id,
    id: doc.id,
    userInfo,
  })

  const [commentState, commentActions] = useCommentManagerState(doc.id)

  const { openModal, openContextModal } = useModal()

  const otherUsers = useMemo(() => {
    return connectedUsers.filter((pUser) => pUser.id !== user.id)
  }, [connectedUsers, user])

  const users = useMemo(() => {
    if (permissions == null) {
      return []
    }

    return permissions.map((permission) => permission.user)
  }, [permissions])

  const docIsNew = !!state?.new
  const previewRef = useRef<HTMLDivElement>(null)
  const syncScroll = useRef<ScrollSync>()
  const [scrollSync, setScrollSync] = useState(true)
  const [viewComments, setViewComments] = useState<HighlightRange[]>([])

  const { settings } = useSettings()
  const fontSize = settings['general.editorFontSize']
  const fontFamily = settings['general.editorFontFamily']

  const editorConfig: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme === 'solarized-dark'
        ? 'solarized dark'
        : editorTheme
    const keyMap = resolveKeyMap(settings['general.editorKeyMap'])
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']

    return {
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      theme,
      indentWithTabs: editorIndentType === 'tab',
      indentUnit: editorIndentSize,
      tabSize: editorIndentSize,
      keyMap,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'indentMore',
      },
    }
  }, [settings])

  const shortcodeConvertMenuStyle: React.CSSProperties = useMemo(() => {
    if (shortcodeConvertMenu == null || editorRef.current == null) {
      return {}
    }

    const editorScroll = editorRef.current.getScrollInfo()
    const bottomPositioning =
      shortcodeConvertMenu.pos.from.bottom - editorScroll.top

    return {
      position: 'absolute',
      top: `${
        bottomPositioning + 125 > editorScroll.clientHeight
          ? bottomPositioning - 140
          : bottomPositioning
      }px`,
      left: `${
        (shortcodeConvertMenu.pos.to.left -
          shortcodeConvertMenu.pos.from.left) /
          2 +
        shortcodeConvertMenu.pos.from.left
      }px`,
    }
  }, [shortcodeConvertMenu])

  const onRender = useRef(() => {
    if (!initialRenderDone.current && window.location.hash) {
      const ele = document.getElementById(window.location.hash.substr(1))
      if (ele != null) {
        ele.scrollIntoView(true)
      }
      initialRenderDone.current = true
    }
    if (previewRef.current != null && editorRef.current != null) {
      if (syncScroll.current == null) {
        syncScroll.current = scrollSyncer(editorRef.current, previewRef.current)
      } else {
        syncScroll.current.rebuild()
      }
    }
  })

  const newRangeThread = useCallback(
    (selection: SelectionContext) => {
      if (realtime == null) {
        return
      }
      const text = realtime.doc.getText('content')
      const anchor = createRelativePositionFromTypeIndex(text, selection.start)
      const head = createRelativePositionFromTypeIndex(text, selection.end)
      setPreferences({ docContextMode: 'comment' })
      commentActions.setMode({
        mode: 'new_thread',
        context: selection.text,
        selection: {
          anchor,
          head,
        },
      })
    },
    [realtime, commentActions, setPreferences]
  )

  const calculatePositions = useCallback(() => {
    if (commentState.mode === 'list_loading' || realtime == null) {
      return
    }

    const comments: HighlightRange[] = []
    for (const thread of commentState.threads) {
      if (thread.selection != null && thread.status.type !== 'outdated') {
        const absoluteAnchor = createAbsolutePositionFromRelativePosition(
          thread.selection.anchor,
          realtime.doc
        )
        const absoluteHead = createAbsolutePositionFromRelativePosition(
          thread.selection.head,
          realtime.doc
        )

        if (
          absoluteAnchor != null &&
          absoluteHead != null &&
          absoluteAnchor.index !== absoluteHead.index
        ) {
          if (thread.status.type === 'open') {
            comments.push({
              id: thread.id,
              start: absoluteAnchor.index,
              end: absoluteHead.index,
              active:
                commentState.mode === 'thread' &&
                thread.id === commentState.thread.id,
            })
          }
        } else if (connState === 'synced') {
          commentActions.threadOutdated(thread)
        }
      }
    }
    setViewComments(comments)
  }, [commentState, realtime, commentActions, connState])

  const commentClick = useCallback(
    (ids: string[]) => {
      if (commentState.mode !== 'list_loading') {
        const idSet = new Set(ids)
        setPreferences({ docContextMode: 'comment' })
        commentActions.setMode({
          mode: 'list',
          filter: (thread) => idSet.has(thread.id),
        })
      }
    },
    [commentState, commentActions, setPreferences]
  )

  const changeEditorLayout = useCallback(
    (target: LayoutMode) => {
      setEditorLayout(target)
      if (target === 'preview') {
        setPreferences({
          lastEditorMode: 'preview',
        })
        return
      }

      setPreferences({
        lastEditorMode: 'edit',
        lastEditorEditLayout: target,
      })
    },
    [setPreferences]
  )

  const editPageKeydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isEditSessionSaveShortcut(event)) {
        preventKeyboardEventPropagation(event)
        return
      }
    }
  }, [])
  useGlobalKeyDownHandler(editPageKeydownHandler)

  const bindCallback = useCallback((editor: CodeMirror.Editor) => {
    setEditorContent(editor.getValue())
    editorRef.current = editor
    attachFileHandlerToCodeMirrorEditor(editor, {
      onFile: async (file) => {
        return fileUploadHandlerRef.current != null
          ? fileUploadHandlerRef.current(file)
          : null
      },
    })
    pasteFormatPlugin(editor, {
      openMenu: (pos, cb) => {
        setShortcodeConvertMenu({ pos, cb })
      },
      closeMenu: () => {
        setShortcodeConvertMenu(null)
      },
      formatter: (pasted) => {
        const githubRegex = /https:\/\/github.com\/([^\/\s]+)\/([^\/\s]+)\/(pull|issues)\/(\d+)/
        const githubMatch = githubRegex.exec(pasted)
        if (githubMatch == null) {
          return null
        }
        const [, org, repo, type, num] = githubMatch
        const entityType = type === 'pull' ? 'github.pr' : 'github.issue'
        return `[[ ${entityType} id="${org}/${repo}#${num}" ]]`
      },
    })
    editor.on('change', (instance) => {
      setEditorContent(instance.getValue())
    })
    editor.on('inputRead', (_, change) => {
      if (change.origin !== '+input') return

      if (editor.getLine(change.to.line) === '[[') {
        editor.showHint({
          container: editor.getWrapperElement(),
          closeOnUnfocus: false,
          alignWithWord: true,
          closeCharacters: /[\n]/,
          hint: () => {
            const line = editor.getLine(editor.getCursor().line)
            const filter = line.slice(2)
            const list = suggestionsRef.current.filter((hint) => {
              return (
                hint.displayText != null &&
                hint.displayText.toLowerCase().includes(filter.toLowerCase())
              )
            })
            return {
              from: { ch: 0, line: change.to.line },
              to: { ch: line.length, line: change.to.line },
              list,
            }
          },
        })
      }
    })
    editor.on(
      'cursorActivity',
      throttle(
        (codeMirror: CodeMirror.Editor) => {
          const doc = codeMirror.getDoc()
          const { line, ch } = doc.getCursor()
          const selections = doc.listSelections()

          setSelection({
            currentCursor: {
              line,
              ch,
            },
            currentSelections: selections,
          })
        },
        500,
        { trailing: true }
      )
    )
  }, [])

  const onTemplatePickCallback = useCallback(
    (template: SerializedTemplate) => {
      if (editorRef.current == null || realtime == null) {
        return
      }
      editorRef.current.setValue(template.content)
    },
    [realtime]
  )

  const setEditorRefContent = useCallback(
    (newValueOrUpdater: string | ((prevValue: string) => string)) => {
      if (editorRef.current == null) {
        return
      }
      const updater =
        typeof newValueOrUpdater === 'string'
          ? () => newValueOrUpdater
          : newValueOrUpdater
      editorRef.current.setValue(updater(editorContent))
    },
    [editorRef, editorContent]
  )

  const onRestoreRevisionCallback = useCallback(
    (rev: SerializedRevision) => {
      if (realtime == null) {
        return
      }
      const realtimeTitle = realtime.doc.getText('title')
      realtimeTitle.delete(0, realtimeTitle.toString().length)
      setEditorRefContent(rev.content)
    },
    [realtime, setEditorRefContent]
  )

  const onEditorTemplateToolClick = useCallback(() => {
    openModal(<TemplatesModal callback={onTemplatePickCallback} />, {
      width: 'large',
    })
  }, [openModal, onTemplatePickCallback])

  const toggleScrollSync = useCallback(() => {
    setScrollSync(not)
  }, [])

  const getEmbed = useCallback(
    async (id: string) => {
      if (team == null) {
        return undefined
      }
      const doc = await loadDoc(id, team.id)
      if (doc == null) {
        return undefined
      }
      const current = `${location.protocol}//${location.host}`
      const link = `${current}${getDocLinkHref(doc, team, 'index')}`
      return {
        title: doc.title,
        content: doc.head != null ? doc.head.content : '',
        link,
      }
    },
    [loadDoc, team]
  )

  const focusEditor = useCallback(() => {
    if (editorLayout === 'preview') {
      return
    }

    if (editorRef.current == null) {
      return
    }

    editorRef.current.focus()
  }, [editorLayout])

  const focusEditorHeading = useCallback(
    (event: CustomEvent<{ heading: string }>) => {
      if (editorLayout === 'preview') {
        return
      }

      if (editorRef.current == null) {
        return
      }

      const heading = event.detail.heading
      const targetHeadingElement = document.getElementById(
        `user-content-${heading}`
      )
      if (targetHeadingElement == null) {
        return
      }
      const dataLineAttribute = targetHeadingElement.attributes.getNamedItem(
        'data-line'
      )
      if (dataLineAttribute == null) {
        return
      }
      const focusLine: number = parseInt(dataLineAttribute.value)
      editorRef.current.focus()
      editorRef.current.setCursor({ line: focusLine - 1, ch: 0 })
    },
    [editorLayout]
  )
  const updateLayout = useCallback(
    (mode: LayoutMode) => {
      if (editorLayout === 'preview' && mode !== 'preview') {
        trackEvent(MixpanelActionTrackTypes.DocLayoutEdit, {
          team: doc.teamId,
          doc: doc.id,
        })
      }

      changeEditorLayout(mode)
    },
    [changeEditorLayout, doc.id, doc.teamId, editorLayout]
  )

  const toggleViewMode = useCallback(() => {
    if (showViewPageRef.current) {
      return
    }
    if (editorLayout === 'preview') {
      changeEditorLayout(preferences.lastEditorEditLayout)
      return
    }

    trackEvent(MixpanelActionTrackTypes.DocLayoutEdit, {
      team: doc.teamId,
      doc: doc.id,
    })
    changeEditorLayout('preview')
  }, [
    changeEditorLayout,
    preferences.lastEditorEditLayout,
    editorLayout,
    doc.teamId,
    doc.id,
  ])

  const toggleSplitEditMode = useCallback(() => {
    if (showViewPageRef.current) {
      return
    }
    updateLayout(editorLayout === 'split' ? 'editor' : 'split')
  }, [updateLayout, editorLayout])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    showViewPageRef.current = !docIsEditable || !currentUserIsCoreMember
  }, [currentUserIsCoreMember, docIsEditable])

  useEffect(() => {
    if (editorLayout === 'preview') {
      return
    }

    if (editorRef.current != null) {
      editorRef.current.focus()
    }
  }, [editorLayout])

  useEffect(() => {
    if (!initialLoadDone) {
      return
    }
    if (editorRef.current != null) {
      editorRef.current.focus()
    }
  }, [initialLoadDone, docIsNew])

  useEffect(() => {
    const { thread } = parse(router.search.slice(1))
    const threadId = Array.isArray(thread) ? thread[0] : thread
    if (threadId != null) {
      commentActions.setMode({ mode: 'thread', thread: { id: threadId } })
      setPreferences({ docContextMode: 'comment' })
    }
  }, [router, commentActions, setPreferences])

  const normalizedCommentState = useMemo(() => {
    if (commentState.mode === 'list_loading' || permissions == null) {
      return commentState
    }

    const normalizedState = { ...commentState }

    const updatedUsers = new Map(
      permissions.map((permission) => [permission.user.id, permission.user])
    )

    normalizedState.threads = normalizedState.threads.map((thread) => {
      if (thread.status.by == null) {
        return thread
      }
      const normalizedUser =
        updatedUsers.get(thread.status.by.id) || thread.status.by

      return { ...thread, status: { ...thread.status, by: normalizedUser } }
    })

    if (normalizedState.mode === 'thread') {
      if (normalizedState.thread.status.by != null) {
        const normalizedUser =
          updatedUsers.get(normalizedState.thread.status.by.id) ||
          normalizedState.thread.status.by
        normalizedState.thread = {
          ...normalizedState.thread,
          status: { ...normalizedState.thread.status, by: normalizedUser },
        }
      }

      normalizedState.comments = normalizedState.comments.map((comment) => {
        const normalizedUser = updatedUsers.get(comment.user.id) || comment.user
        return { ...comment, user: normalizedUser }
      })
    }

    return normalizedState
  }, [commentState, permissions])

  useEffect(() => {
    if (team != null) {
      fileUploadHandlerRef.current = async (file) => {
        try {
          const { file: fileInfo } = await uploadFile(team, file, doc)
          const url = buildTeamFileUrl(team, fileInfo.name)
          if (file.type.match(/image\/.*/)) {
            return { type: 'img', url, alt: file.name }
          } else {
            return { type: 'file', url, title: file.name }
          }
        } catch (err) {
          pushApiErrorMessage(err)
          return null
        }
      }
    } else {
      fileUploadHandlerRef.current = undefined
    }
  }, [team, pushMessage, pushApiErrorMessage, doc])

  useEffect(() => {
    return () => {
      setInitialLoadDone(false)
    }
  }, [doc.id])

  useEffect(() => {
    if (
      mountedRef.current &&
      (connState === 'synced' || connState === 'loaded')
    ) {
      setInitialLoadDone(true)
    }
  }, [connState])

  useEffect(() => {
    suggestionsRef.current = Array.from(docsMap.values()).map((doc) => {
      const workspace = workspacesMap.get(doc.workspaceId)
      const path = `${workspace != null ? workspace.name : ''}${
        doc.folderPathname === '/' ? '' : doc.folderPathname
      }`
      return {
        text: `[[ boostnote.doc id="${doc.id}" ]]`,
        displayText: `${path}/${getDocTitle(doc)}`,
      }
    })
  }, [docsMap, workspacesMap])

  useEffect(() => {
    if (syncScroll.current != null) {
      scrollSync ? syncScroll.current.unpause() : syncScroll.current.pause()
    }
  }, [scrollSync])

  useEffect(() => {
    return () => {
      if (syncScroll.current != null) {
        syncScroll.current.destroy()
        syncScroll.current = undefined
      }
    }
  }, [doc])

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.refresh()
    }
  }, [editorLayout])

  useEffect(() => {
    focusEditorEventEmitter.listen(focusEditor)
    return () => {
      focusEditorEventEmitter.unlisten(focusEditor)
    }
  }, [focusEditor])

  useEffect(() => {
    focusEditorHeadingEventEmitter.listen(focusEditorHeading)
    return () => {
      focusEditorHeadingEventEmitter.unlisten(focusEditorHeading)
    }
  }, [focusEditorHeading])

  useEffect(() => {
    if (realtime != null) {
      realtime.doc.on('update', calculatePositions)
      return () => realtime.doc.off('update', calculatePositions)
    }
    return undefined
  }, [realtime, calculatePositions])

  useEffect(() => {
    calculatePositions()
  }, [calculatePositions])

  useEffect(() => {
    if (!mountedRef.current) return
    if (docRef.current !== doc.id) {
      if (showViewPageRef.current) {
        setEditorLayout('preview')
        docRef.current = doc.id
        return
      }

      if (docIsNew) {
        changeEditorLayout(preferences.lastEditorEditLayout)
      } else {
        setEditorLayout(
          preferences.lastEditorMode === 'preview'
            ? 'preview'
            : preferences.lastEditorEditLayout
        )
      }
      docRef.current = doc.id
    }
  }, [
    doc.id,
    docIsNew,
    preferences.lastEditorEditLayout,
    preferences.lastEditorMode,
    changeEditorLayout,
  ])

  useEffect(() => {
    togglePreviewModeEventEmitter.listen(toggleViewMode)
    return () => {
      togglePreviewModeEventEmitter.unlisten(toggleViewMode)
    }
  }, [toggleViewMode])

  useEffect(() => {
    toggleSplitEditModeEventEmitter.listen(toggleSplitEditMode)
    return () => {
      toggleSplitEditModeEventEmitter.unlisten(toggleSplitEditMode)
    }
  }, [toggleSplitEditMode])

  if (!initialLoadDone) {
    return (
      <StyledLoadingView>
        <h3>Loading..</h3>
        <span>
          <Spinner />
        </span>
      </StyledLoadingView>
    )
  }

  return (
    <ApplicationPage
      right={
        preferences.docContextMode === 'comment' ? (
          <PreferencesContextMenuWrapper>
            <CommentManager
              state={normalizedCommentState}
              user={user}
              users={users}
              {...commentActions}
            />
          </PreferencesContextMenuWrapper>
        ) : null
      }
    >
      <ApplicationTopbar
        controls={
          [
            {
              type: 'node',
              element: <InviteCTAButton origin='doc-page' key='invite-cta' />,
            },
            {
              type: 'separator',
            },
            ...(connState === 'reconnecting'
              ? [
                  {
                    type: 'button',
                    variant: 'secondary' as const,
                    disabled: true,
                    label: translate(lngKeys.EditorReconnectAttempt),
                    tooltip: (
                      <>
                        {translate(lngKeys.EditorReconnectAttempt1)}
                        <br />
                        {translate(lngKeys.EditorReconnectAttempt2)}
                      </>
                    ),
                  },
                ]
              : connState === 'disconnected'
              ? [
                  {
                    type: 'button',
                    variant: 'warning' as const,
                    onClick: () => realtime.connect(),
                    label: translate(lngKeys.EditorReconnectDisconnected),
                    tooltip: (
                      <>
                        {translate(lngKeys.EditorReconnectDisconnected1)}
                        <br />
                        {translate(lngKeys.EditorReconnectDisconnected2)}
                      </>
                    ),
                  },
                ]
              : connState === 'loaded'
              ? [
                  {
                    type: 'button',
                    variant: 'secondary' as const,
                    disabled: true,
                    label: translate(lngKeys.EditorReconnectSyncing),
                    tooltip: (
                      <>
                        {translate(lngKeys.EditorReconnectSyncing1)}
                        <br />
                        {translate(lngKeys.EditorReconnectSyncing2)}
                      </>
                    ),
                  },
                ]
              : []),
            ...(docIsEditable && currentUserIsCoreMember
              ? [
                  {
                    type: 'button',
                    variant: 'icon',
                    iconPath: mdiPencil,
                    active: editorLayout === 'editor',
                    onClick: () => updateLayout('editor'),
                  },
                  {
                    type: 'button',
                    variant: 'icon',
                    iconPath: mdiViewSplitVertical,
                    active: editorLayout === 'split',
                    onClick: () => updateLayout('split'),
                  },
                  {
                    type: 'button',
                    variant: 'icon',
                    iconPath: mdiEyeOutline,
                    active: editorLayout === 'preview',
                    onClick: () => updateLayout('preview'),
                  },
                  {
                    type: 'separator',
                  },
                ]
              : []),
            {
              type: 'button',
              variant: 'secondary',
              label: translate(lngKeys.Share),
              onClick: (event) =>
                openContextModal(
                  event,
                  <DocShare currentDoc={doc} team={team} />,
                  { width: 440, alignment: 'bottom-right' }
                ),
            },
            {
              variant: 'icon',
              iconPath: mdiDotsHorizontal,
              onClick: (event) => {
                openContextModal(
                  event,
                  <DocContextMenu
                    currentDoc={doc}
                    contributors={contributors}
                    backLinks={backLinks}
                    team={team}
                    restoreRevision={onRestoreRevisionCallback}
                    editorRef={editorRef}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    permissions={permissions || []}
                  />,
                  {
                    alignment: 'bottom-right',
                    removePadding: true,
                    hideBackground: true,
                  }
                )
              },
            },
          ] as TopbarControlProps[]
        }
      >
        {currentUserPermissions != null && (
          <StyledTopbarChildrenContainer>
            <LoadingButton
              variant='icon'
              disabled={sendingMap.has(doc.id)}
              spinning={sendingMap.has(doc.id)}
              size='sm'
              iconPath={doc.bookmarked ? mdiStar : mdiStarOutline}
              onClick={() =>
                toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked)
              }
            />

            <PresenceIcons user={userInfo} users={otherUsers} />
          </StyledTopbarChildrenContainer>
        )}
      </ApplicationTopbar>
      <ApplicationContent>
        <EditorLayout
          doc={doc}
          docIsEditable={true}
          fullWidth={editorLayout !== 'preview'}
          team={team}
        >
          <Container>
            {editorLayout !== 'preview' && (
              <StyledLayoutDimensions className={editorLayout}>
                <ToolbarRow>
                  <EditorToolButton
                    tooltip={
                      scrollSync
                        ? translate(
                            lngKeys.EditorToolbarTooltipScrollSyncDisable
                          )
                        : translate(
                            lngKeys.EditorToolbarTooltipScrollSyncEnable
                          )
                    }
                    path={scrollSync ? mdiRepeatOff : mdiRepeat}
                    onClick={toggleScrollSync}
                    className='scroll-sync'
                  />
                  <EditorToolbar editorRef={editorRef} />
                  <EditorToolbarUpload
                    editorRef={editorRef}
                    fileUploadHandlerRef={fileUploadHandlerRef}
                  />
                  <EditorToolButton
                    tooltip={translate(lngKeys.EditorToolbarTooltipTemplate)}
                    path={mdiFileDocumentOutline}
                    onClick={onEditorTemplateToolClick}
                  />
                </ToolbarRow>
              </StyledLayoutDimensions>
            )}
            <StyledEditor className={editorLayout}>
              <StyledEditorWrapper
                className={`layout-${editorLayout}`}
                fontFamily={fontFamily}
                fontSize={fontSize}
              >
                <>
                  <CodeMirrorEditor
                    bind={bindCallback}
                    config={editorConfig}
                    realtime={realtime}
                  />
                  {editorContent === '' && (
                    <EditorTemplateButton
                      onTemplatePickCallback={onTemplatePickCallback}
                    />
                  )}
                  {shortcodeConvertMenu !== null && (
                    <StyledShortcodeConvertMenu
                      style={shortcodeConvertMenuStyle}
                    >
                      <button onClick={() => shortcodeConvertMenu.cb(false)}>
                        Dismiss
                      </button>
                      <button onClick={() => shortcodeConvertMenu.cb(true)}>
                        Create embed
                      </button>
                    </StyledShortcodeConvertMenu>
                  )}
                </>
              </StyledEditorWrapper>
              <StyledPreview className={`layout-${editorLayout}`}>
                <MarkdownView
                  content={editorContent}
                  updateContent={setEditorRefContent}
                  headerLinks={editorLayout === 'preview'}
                  onRender={onRender.current}
                  className='scroller'
                  getEmbed={getEmbed}
                  scrollerRef={previewRef}
                  comments={viewComments}
                  commentClick={commentClick}
                  SelectionMenu={({ selection }) => (
                    <StyledSelectionMenu>
                      <div onClick={() => newRangeThread(selection)}>
                        <Icon size={20} path={mdiCommentTextOutline} />
                      </div>
                    </StyledSelectionMenu>
                  )}
                />
              </StyledPreview>
            </StyledEditor>

            {editorLayout !== 'preview' && (
              <StyledBottomBar>
                <EditorSelectionStatus
                  cursor={selection.currentCursor}
                  selections={selection.currentSelections}
                />
                <EditorKeyMapSelect />
                <EditorThemeSelect />
                <EditorIndentationStatus />
              </StyledBottomBar>
            )}
          </Container>
        </EditorLayout>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;

  .layout-split .scroller {
    padding-left: 48px !important;
    padding-right: 48px !important;
  }
`

const StyledTopbarChildrenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledBottomBar = styled.div`
  display: flex;
  position: relative;
  flex: 0 0 auto;
  border-top: solid 1px ${({ theme }) => theme.colors.border.main};
  height: 24px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  box-sizing: content-box;
  & > :first-child {
    flex: 1;
  }
`

const StyledShortcodeConvertMenu = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  border-radius: 5px;
  box-shadow: ${({ theme }) => theme.colors.shadow};

  button {
    display: block;
    width: 200px;
    line-height: 25px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    text-align: left;

    &:first-child {
      border-radius: 5px 5px 0 0;
    }

    &:last-child {
      border-radius: 0 0 5px 5px;
    }

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
      opacity: 0.8;
      cursor: pointer;
    }
  }
`

const StyledLayoutDimensions = styled.div`
  width: 100%;
  &.preview,
  .preview {
    width: 100%;
    height: auto;
  }
`

const StyledLoadingView = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  & span {
    width: 100%;
    height: 38px;
    position: relative;
  }
`

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  bottom: ${({ theme }) => theme.sizes.spaces.l}px;
  right: 0;
  left: 0;
  margin: auto;
  z-index: 1;
  width: fit-content;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: solid 1px ${({ theme }) => theme.colors.border.second};
  border-radius: 5px;
`
interface FontOptionsProps {
  fontSize: string
  fontFamily: string
}
const StyledEditorWrapper = styled.div<BaseTheme & FontOptionsProps>`
  position: relative;
  height: auto;
  width: 50%;
  &.layout-editor {
    width: 100%;
  }
  &.layout-preview {
    display: none;
  }

  & .CodeMirror * {
    font-size: ${({ fontSize }) =>
      fontSize == null ? 'inherit' : `${fontSize}px`};
    font-family: ${({ fontFamily }) =>
      fontFamily == null ? 'monospace' : fontFamily};
  }
`

const StyledPreview = styled.div`
  height: 100%;
  width: 50%;
  &.layout-split {
    width: 50%;
    .scroller {
      height: 100%;
      overflow: auto;
      border-left: 1px solid ${({ theme }) => theme.colors.border.main};
    }
  }
  &.layout-preview {
    padding-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin: 0 auto;
    width: 100%;
  }
  &.layout-editor {
    display: none;
  }

  & .inline-comment.active,
  .inline-comment.hv-active {
    background-color: rgba(112, 84, 0, 0.8);
  }
`

const StyledSelectionMenu = styled.div`
  display: flex;
  padding: 8px;
  max-height: 37px;
  cursor: pointer;
`

const StyledEditor = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  position: relative;
  top: 0;
  bottom: 0px;
  width: 100%;
  height: auto;
  min-height: 0;
  font-size: 15px;
  &.preview,
  .preview {
    ${rightSidePageLayout}
    margin: auto;
  }
  & .CodeMirrorWrapper {
    height: 100%;
    word-break: break-word;
  }
  & .CodeMirror {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0 !important;
    line-height: 1.4em;
    .CodeMirror-hints {
      position: absolute;
      z-index: 10;
      overflow: auto;
      max-width: 90%;
      max-height: 20em;
      margin: 0;
      padding: 0;
      border-radius: 3px;
      border: 1px solid ${({ theme }) => theme.colors.border.main};
      background: ${({ theme }) => theme.colors.background.primary};
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: 90%;
      font-family: monospace;
      list-style: none;
    }
    .CodeMirror-hint {
      position: relative;
      margin: 0;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px
        ${({ theme }) => theme.sizes.spaces.sm}px;
      white-space: pre;
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;
      font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    }
    li.CodeMirror-hint-active {
      color: ${({ theme }) => theme.colors.variants.primary.base};
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 3px;
        left: ${({ theme }) => theme.sizes.spaces.xsm}px;
        width: 3px;
        height: 22px;
        background-color: ${({ theme }) => theme.colors.variants.primary.base};
      }
    }
    & .remote-caret {
      position: relative;
      border-left: 1px solid black;
      margin-left: -1px;
      box-sizing: border-box;
      &:hover > div {
        opacity: 1;
        transition-delay: 0s;
      }
      & > div {
        position: absolute;
        left: -1px;
        height: 100%;
        top: 0;
        transform: translate3d(0, -100%, 0);
        font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
        height: ${({ theme }) => theme.sizes.fonts.xsm + 4}px;
        line-height: ${({ theme }) => theme.sizes.fonts.xsm + 4}px;
        vertical-align: middle;
        background-color: rgb(250, 129, 0);
        user-select: none;
        color: white;
        padding-left: 2px;
        padding-right: 2px;
        z-index: 3;
        transition: opacity 0.3s ease-in-out;
        white-space: nowrap;
      }
    }
  }
  .CodeMirror-scroll {
    position: relative;
    z-index: 0;
    width: 100%;
  }
  .CodeMirror-code,
  .CodeMirror-gutters {
    padding-bottom: 32px;
  }
  & .file-loading-widget {
    transform: translate3d(0, -100%, 0);
  }
`

export default Editor

function resolveKeyMap(keyMap: CodeMirrorKeyMap) {
  switch (keyMap) {
    case 'vim':
      return 'vim'
    case 'default':
    default:
      return 'sublime'
  }
}