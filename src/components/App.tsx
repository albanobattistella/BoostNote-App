import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Router from './Router'
import { ThemeProvider } from 'styled-components'
import { useDb } from '../lib/db'
import PreferencesModal from './PreferencesModal/PreferencesModal'
import { usePreferences } from '../lib/preferences'
import '../lib/i18n'
import { useEffectOnce } from 'react-use'
import { useRouter } from '../lib/router'
import { keys } from '../lib/db/utils'
import { addIpcListener, removeIpcListener } from '../lib/electronOnly'
import { useGeneralStatus } from '../lib/generalStatus'
import { useBoostNoteProtocol } from '../lib/protocol'
import { useBoostHub, getBoostHubTeamIconUrl } from '../lib/boosthub'
import {
  boostHubTeamCreateEventEmitter,
  BoostHubTeamCreateEvent,
  BoostHubTeamUpdateEvent,
  boostHubTeamUpdateEventEmitter,
  BoostHubTeamDeleteEvent,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
  boostHubLoginRequestEventEmitter,
  boostHubCreateLocalSpaceEventEmitter,
  BoostHubSubscriptionDeleteEvent,
  boostHubSubscriptionDeleteEventEmitter,
  boostHubSubscriptionUpdateEventEmitter,
  boostHubCreateCloudSpaceEventEmitter,
} from '../lib/events'
import { useRouteParams } from '../lib/routeParams'
import { useStorageRouter } from '../lib/storageRouter'
import { selectV2Theme } from '../design/lib/styled/styleFunctions'
import Modal from '../design/components/organisms/Modal'
import GlobalStyle from '../design/components/atoms/GlobalStyle'
import { DialogIconTypes, useDialog } from '../design/lib/stores/dialog'
import Dialog from '../design/components/organisms/Dialog/Dialog'
import ContextMenu from '../design/components/molecules/ContextMenu'
import { useCloudIntroModal } from '../lib/cloudIntroModal'
import CloudIntroModal from './organisms/CloudIntroModal'
import AppNavigator from './organisms/AppNavigator'
import Toast from '../design/components/organisms/Toast'
import styled from '../design/lib/styled'
import { mockBackend } from '../cloud/lib/consts'

const LoadingText = styled.div`
  margin: 30px;
`

const AppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
`

const App = () => {
  const { initialize, storageMap } = useDb()
  const { push, pathname } = useRouter()
  const [initialized, setInitialized] = useState(false)
  const { setGeneralStatus, generalStatus } = useGeneralStatus()
  const { preferences, setPreferences } = usePreferences()
  const { fetchDesktopGlobalData } = useBoostHub()
  const routeParams = useRouteParams()
  const { navigate: navigateToStorage } = useStorageRouter()
  const { messageBox } = useDialog()

  useEffectOnce(() => {
    const fetchDesktopGlobalDataOfCloud = async () => {
      if (mockBackend) {
        const desktopGlobalData = {
          user: {
            id: 'dev',
            uniqueName: 'dev-user',
            displayName: 'dev-user',
            accessToken: 'dev-user-access-token',
          },
          teams: [
            {
              id: 'dev',
              name: 'dev',
              domain: 'dev',
              createdAt: '',
              permissions: [],
              trial: false,
            },
          ],
        }

        setPreferences({
          'cloud.user': {
            ...desktopGlobalData.user,
          },
        })
        setGeneralStatus({
          boostHubTeams: desktopGlobalData.teams.map((team) => {
            return {
              id: team.id,
              name: team.name,
              domain: team.domain,
              createdAt: team.createdAt,
              permissions: team.permissions,
              trial: team.trial,
            }
          }),
        })
        return desktopGlobalData
      }
      const cloudUserInfo = preferences['cloud.user']
      if (cloudUserInfo == null) {
        return
      }

      const accessToken = cloudUserInfo.accessToken
      const desktopGlobalData = await fetchDesktopGlobalData(
        cloudUserInfo.accessToken
      )

      if (desktopGlobalData.user == null) {
        messageBox({
          title: 'Sign In',
          message: 'Your cloud access token has been expired.',
          buttons: [
            {
              label: 'Sign In Again',
              defaultButton: true,
              onClick: () => {
                push(`/app/boosthub/login`)
                setTimeout(() => {
                  boostHubLoginRequestEventEmitter.dispatch()
                }, 1000)
              },
            },
            {
              label: 'Cancel',
              cancelButton: true,
              onClick: () => {
                setPreferences({
                  'cloud.user': undefined,
                })
                setGeneralStatus({
                  boostHubTeams: [],
                })
              },
            },
          ],
          iconType: DialogIconTypes.Warning,
        })
        return
      }
      const user = desktopGlobalData.user
      setPreferences({
        'cloud.user': {
          id: user.id,
          uniqueName: user.uniqueName,
          displayName: user.displayName,
          accessToken,
        },
      })
      setGeneralStatus({
        boostHubTeams: desktopGlobalData.teams.map((team) => {
          return {
            id: team.id,
            name: team.name,
            domain: team.domain,
            createdAt: team.createdAt,
            subscription: team.subscription,
            permissions: team.permissions,
            trial: team.trial,
            iconUrl:
              team.icon != null
                ? getBoostHubTeamIconUrl(team.icon.location)
                : undefined,
          }
        }),
      })
      return desktopGlobalData
    }

    initialize()
      .then(async () => {
        const globalData = await fetchDesktopGlobalDataOfCloud().catch(
          (error) => {
            console.warn('There was an issue while fetching cloud space data')
            console.warn(error)
          }
        )

        const cloudSpaces = globalData != null ? globalData.teams : []

        if (
          pathname === '' ||
          pathname === '/' ||
          pathname === '/app' ||
          pathname === '/app/storages'
        ) {
          if (cloudSpaces.length > 0) {
            push(`/app/boosthub/teams/${cloudSpaces[0].domain}`)
          } else {
            if (globalData == null || globalData.user == null) {
              push(`/app/boosthub/login`)
            } else {
              push(`/app/boosthub/teams`)
            }
          }
        }
        setInitialized(true)
      })
      .catch((error) => {
        console.error(error)
      })
  })

  useEffect(() => {
    const boostHubTeamCreateEventHandler = (event: BoostHubTeamCreateEvent) => {
      const createdTeam = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.set(createdTeam.id, {
          id: createdTeam.id,
          name: createdTeam.name,
          domain: createdTeam.domain,
          iconUrl:
            createdTeam.icon != null
              ? getBoostHubTeamIconUrl(createdTeam.icon.location)
              : undefined,
        })
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
      push(`/app/boosthub/teams/${createdTeam.domain}`)
    }

    const boostHubTeamUpdateEventHandler = (event: BoostHubTeamUpdateEvent) => {
      const updatedTeam = event.detail.team
      if (updatedTeam.id == null) {
        return
      }
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.set(updatedTeam.id, {
          id: updatedTeam.id,
          name: updatedTeam.name,
          domain: updatedTeam.domain,
          iconUrl:
            updatedTeam.icon != null
              ? getBoostHubTeamIconUrl(updatedTeam.icon.location)
              : undefined,
        })
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubTeamDeleteEventHandler = (event: BoostHubTeamDeleteEvent) => {
      push(`/app`)
      const deletedTeam = event.detail.team
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        teamMap.delete(deletedTeam.id)
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubSubscriptioUpdateEventHandler = (
      event: BoostHubSubscriptionDeleteEvent
    ) => {
      const updatedSub = event.detail.subscription
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            if (updatedSub.teamId === team.id) {
              map.set(team.id, { ...team, subscription: updatedSub })
              return map
            }
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubSubscriptionDeleteEventHandler = (
      event: BoostHubSubscriptionDeleteEvent
    ) => {
      const deletedSub = event.detail.subscription
      setGeneralStatus((previousGeneralStatus) => {
        const teamMap =
          previousGeneralStatus.boostHubTeams!.reduce((map, team) => {
            if (deletedSub.teamId === team.id) {
              map.set(team.id, { ...team, subscription: undefined })
              return map
            }
            map.set(team.id, team)
            return map
          }, new Map()) || new Map()
        return {
          boostHubTeams: [...teamMap.values()],
        }
      })
    }

    const boostHubAccountDeleteEventHandler = () => {
      push(`/app`)
      setPreferences({
        'cloud.user': null,
      })
      setGeneralStatus({
        boostHubTeams: [],
      })
    }

    const boostHubCreateLocalSpaceEventHandler = () => {
      push(`/app/storages`)
    }

    const boostHubCreateCloudSpaceEventHandler = () => {
      push('/app/boosthub/teams')
    }

    boostHubSubscriptionDeleteEventEmitter.listen(
      boostHubSubscriptionDeleteEventHandler
    )
    boostHubSubscriptionUpdateEventEmitter.listen(
      boostHubSubscriptioUpdateEventHandler
    )
    boostHubTeamCreateEventEmitter.listen(boostHubTeamCreateEventHandler)
    boostHubTeamUpdateEventEmitter.listen(boostHubTeamUpdateEventHandler)
    boostHubTeamDeleteEventEmitter.listen(boostHubTeamDeleteEventHandler)
    boostHubAccountDeleteEventEmitter.listen(boostHubAccountDeleteEventHandler)
    boostHubCreateLocalSpaceEventEmitter.listen(
      boostHubCreateLocalSpaceEventHandler
    )
    boostHubCreateCloudSpaceEventEmitter.listen(
      boostHubCreateCloudSpaceEventHandler
    )
    return () => {
      boostHubSubscriptionDeleteEventEmitter.unlisten(
        boostHubSubscriptionDeleteEventHandler
      )
      boostHubSubscriptionUpdateEventEmitter.unlisten(
        boostHubSubscriptioUpdateEventHandler
      )
      boostHubTeamCreateEventEmitter.unlisten(boostHubTeamCreateEventHandler)
      boostHubTeamUpdateEventEmitter.unlisten(boostHubTeamUpdateEventHandler)
      boostHubTeamDeleteEventEmitter.unlisten(boostHubTeamDeleteEventHandler)
      boostHubAccountDeleteEventEmitter.unlisten(
        boostHubAccountDeleteEventHandler
      )
      boostHubCreateLocalSpaceEventEmitter.unlisten(
        boostHubCreateLocalSpaceEventHandler
      )
      boostHubCreateCloudSpaceEventEmitter.unlisten(
        boostHubCreateCloudSpaceEventHandler
      )
    }
  }, [push, setPreferences, setGeneralStatus])
  const { boostHubTeams } = generalStatus
  const switchWorkspaceHandler = useCallback(
    (_event: any, index: number) => {
      const storageIds = keys(storageMap)
      const boostHubDomains = boostHubTeams.map((team) => team.domain)

      if (storageIds.length > index) {
        const targetStorageId = storageIds[index]
        navigateToStorage(targetStorageId)
      } else {
        const targetDomain = boostHubDomains[index - storageIds.length]
        if (targetDomain == null) {
          return
        }

        push(`/app/boosthub/teams/${targetDomain}`)
      }
    },
    [storageMap, boostHubTeams, navigateToStorage, push]
  )

  useEffect(() => {
    addIpcListener('switch-workspace', switchWorkspaceHandler)
    return () => {
      removeIpcListener('switch-workspace', switchWorkspaceHandler)
    }
  }, [switchWorkspaceHandler])

  useEffect(() => {
    const createCloudSpaceHandler = () => {
      boostHubCreateCloudSpaceEventEmitter.dispatch()
    }
    addIpcListener('create-cloud-space', createCloudSpaceHandler)

    return () => {
      removeIpcListener('create-cloud-space', createCloudSpaceHandler)
    }
  }, [push])

  useBoostNoteProtocol()

  const { showingCloudIntroModal } = useCloudIntroModal()

  const activeBoostHubTeamDomain = useMemo<string | null>(() => {
    if (routeParams.name !== 'boosthub.teams.show') {
      return null
    }
    return routeParams.domain
  }, [routeParams])

  const showingAppNavigator =
    activeBoostHubTeamDomain != null
      ? generalStatus.boostHubTeams.find(
          (team) => team.domain === activeBoostHubTeamDomain
        ) != null
      : routeParams.name == 'boosthub.teams.create'

  return (
    <ThemeProvider theme={selectV2Theme(preferences['general.theme'] as any)}>
      <AppContainer
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()
        }}
      >
        {initialized ? (
          <>
            {showingAppNavigator != null ? (
              <AppNavigator />
            ) : (
              showingCloudIntroModal && <CloudIntroModal />
            )}
            <Router />
          </>
        ) : (
          <LoadingText>Loading Data...</LoadingText>
        )}
        <GlobalStyle />

        <Toast />
        <PreferencesModal />
        <ContextMenu />

        <Dialog />
        <Modal />
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
