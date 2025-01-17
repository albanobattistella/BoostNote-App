import React, { useCallback, useState, useMemo } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../../design/lib/styled'
import UserIcon from '../UserIcon'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import DocPropertyValueButton from './DocPropertyValueButton'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useModal } from '../../../design/lib/stores/modal'
import { SearchableListOption } from '../../../design/components/molecules/SearchableOptionList'
import SearchableOptionListPopup from '../SearchableOptionListPopup'
import Button from '../../../design/components/atoms/Button'
import InviteMembersModal from '../Modal/InviteMembers/InviteMembersModal'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

interface DocAssigneeSelectProps {
  disabled?: boolean
  defaultValue: string[]
  update: (value: string[]) => void
  isLoading: boolean
  readOnly: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
}

const DocAssigneeSelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  readOnly,
  update,
  popupAlignment = 'bottom-left',
}: DocAssigneeSelectProps) => {
  const { translate } = useI18n()
  const { openContextModal, closeAllModals } = useModal()
  const { permissions = [] } = usePage()

  const updateAssignees = useCallback(
    (selectedUserIds: string[]) => {
      update(selectedUserIds)
      closeAllModals()
    },
    [update, closeAllModals]
  )

  const selectedUsers = useMemo(() => {
    if (defaultValue.length === 0) {
      return null
    }

    return (
      <div className='doc__assignees__wrapper'>
        {permissions
          .filter((p) => defaultValue.includes(p.userId) && p.user != null)
          .map((p) => (
            <UserIcon user={p.user} className='doc__assignee' key={p.id} />
          ))}
      </div>
    )
  }, [defaultValue, permissions])

  return (
    <Container className='doc__assignee__select prop__margin'>
      <DocPropertyValueButton
        disabled={disabled}
        sending={isLoading}
        empty={defaultValue.length === 0}
        isReadOnly={readOnly}
        iconPath={
          defaultValue.length === 0 ? mdiAccountCircleOutline : undefined
        }
        onClick={(e) =>
          openContextModal(
            e,
            <DocAssigneeModal
              selectedUsers={defaultValue}
              submitUpdate={updateAssignees}
              closeModal={closeAllModals}
            />,
            {
              alignment: popupAlignment,
              width: 300,
            }
          )
        }
      >
        {defaultValue.length !== 0
          ? selectedUsers
          : translate(lngKeys.Unassigned)}
      </DocPropertyValueButton>
    </Container>
  )
}

const Container = styled.div`
  .doc__assignees__wrapper {
    display: flex;
    width: auto;
    align-items: center;
  }

  .doc__assignee {
    display: inline-flex;
    width: 22px;
    height: 22px;
    line-height: 19px;
    margin-right: 0;
  }
`

const DocAssigneeModal = ({
  selectedUsers,
  submitUpdate,
  closeModal,
}: {
  selectedUsers: string[]
  submitUpdate: (val: string[]) => void
  closeModal: () => void
}) => {
  const { permissions = [] } = usePage()
  const [value, setValue] = useState<string[]>(selectedUsers)
  const [query, setQuery] = useState<string>('')
  const { translate } = useI18n()
  const { openModal } = useModal()

  const toggleUser = useCallback((userId: string) => {
    setValue((prev) => {
      const newValue = prev.slice()
      if (newValue.includes(userId)) {
        return newValue.filter((id) => id !== userId)
      } else {
        newValue.push(userId)
        return newValue
      }
    })
  }, [])

  const matchedUsers = useMemo(() => {
    const trimmed = query.trim().toLocaleLowerCase()
    if (trimmed === '') {
      return permissions.map((p) => p.user)
    }

    return permissions
      .filter((p) => p.user.displayName.toLocaleLowerCase().includes(trimmed))
      .map((p) => p.user)
  }, [permissions, query])

  const availableOptions: SearchableListOption[] = useMemo(() => {
    return matchedUsers.map((user) => {
      return {
        onClick: () => toggleUser(user.id),
        label: user.displayName,
        checked: value.includes(user.id),
        icon: <UserIcon user={user} className='assignee__item__icon' />,
      }
    })
  }, [matchedUsers, toggleUser, value])

  const onInviteMoreMembers = useCallback(() => {
    openModal(<InviteMembersModal />, { showCloseIcon: true })
    return trackEvent(MixpanelActionTrackTypes.InviteFromDocPage)
  }, [openModal])

  return (
    <ModalContainer>
      <InviteButtonSection>
        <Button
          className={'invite__members__button-width'}
          variant={'secondary'}
          onClick={onInviteMoreMembers}
        >
          {translate(lngKeys.InviteMembersDocAssignButton)}
        </Button>
      </InviteButtonSection>
      <SearchableOptionListPopup
        query={query}
        setQuery={setQuery}
        options={availableOptions}
        onSubmit={() => submitUpdate(value)}
        onCancel={closeModal}
      />
    </ModalContainer>
  )
}

const InviteButtonSection = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex-direction: row;

  margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;

  .invite__members__button-width {
    width: 100%;
  }
`

const ModalContainer = styled.div`
  .assignee__item__icon {
    width: 24px;
    height: 24px;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default DocAssigneeSelect
