/***
 * RULES *
 *
 * general usage / word for word translation: precede by General / general.
 * componentSpecific: precede by component name for easier identification
 *
 * keys
 * uppercases should appear where they are present
 * verbs should generally be suffixed by Verb, reason:  in some roman languages both noun and verb can have the same english translation: ex => Open = Ouvert or Ouvrir
 * Even in english. With translation keys we should be able to know the context so indicating verb or noun is good.
 */

export enum lngKeys {
  GeneralError = 'general.error',
  GeneralCreate = 'general.create',
  GeneralCancel = 'general.cancel',
  GeneralUpdate = 'general.update',
  GeneralAttachments = 'general.attachments',
  GeneralArchive = 'general.archive',
  GeneralSignin = 'general.signin',
  GeneralSigningIn = 'general.signingin',
  GeneralSignout = 'general.signout',
  GeneralSave = 'general.save',
  GeneralDefault = 'general.default',
  GeneralDelete = 'general.delete',
  GeneralDaily = 'general.daily',
  GeneralWeekly = 'general.weekly',
  GeneralNever = 'general.never',
  GeneralTemplates = 'general.templates',
  GeneralTitle = 'general.title',
  GeneralUse = 'general.use',
  GeneralChangeIcon = 'general.changeicon',
  GeneralOwner = 'general.Owner',
  GeneralAddVerb = 'general.Addverb',
  GeneralSelectAll = 'general.Select.all',
  GeneralSelectVerb = 'general.Select',
  GeneralAll = 'general.All',
  GeneralAny = 'general.Any',
  GeneralPickYourDestination = 'general.Pick.your.destination',
  GeneralOpenVerb = 'general.Openverb',
  OpenInBrowser = 'general.open.in.browser',
  GeneralCopyTheLink = 'general.Copy.the.link',
  GeneralMoveVerb = 'general.Moveverb',
  GeneralSource = 'general.Source',
  GeneralDestination = 'general.Destination',
  GeneralPrevious = 'general.Previous',
  GeneralNext = 'general.Next',
  GeneralContinueVerb = 'general.Continueverb',
  GeneralShared = 'general.Shared',
  GeneralSmartFolders = 'general.Smart.Folders',
  GeneralBookmarks = 'general.Bookmarks',
  GeneralUnbookmarkVerb = 'general.Unbookmarkverb',
  GeneralBookmarkVerb = 'general.Bookmarkverb',
  GeneralWorkspaces = 'general.Workspaces',
  GeneralPrivate = 'general.Private',
  GeneralLabels = 'general.Labels',
  GeneralMore = 'general.More',
  GeneralStatus = 'general.Status',
  GeneralRenameVerb = 'general.Renameverb',
  GeneralEditVerb = 'general.Editverb',
  GeneralSettings = 'general.Settings',
  GeneralImport = 'general.Import',
  GeneralTimeline = 'general.Timeline',
  GeneralSearchVerb = 'general.Searchverb',
  GeneralHelp = 'general.Help',
  GeneralThisSpace = 'general.This.space',
  GeneralProfilePicture = 'general.Profile.picture',
  GeneralName = 'general.Name',
  GeneralLogo = 'general.Logo',
  GeneralSpaces = 'general.Spaces',
  GeneralTabs = 'general.Tabs',
  GeneralUser = 'general.User',
  GeneralSeeVerb = 'general.Seeverb',
  GeneralAdmin = 'general.Admin',
  GeneralMembers = 'general.Members',
  GeneralMember = 'general.Member',
  GeneralViewer = 'general.Viewer',
  GeneralLeaveVerb = 'general.Leaveverb',
  GeneralRemoveVerb = 'general.Remove',
  GeneralCopyVerb = 'general.Copy',
  GeneralCopied = 'general.Copied',
  GeneralSendVerb = 'general.Sendverb',
  GeneralPromoteVerb = 'general.Promoteverb',
  GeneralDemoteVerb = 'general.Demoteverb',
  GeneralEnableVerb = 'general.Enableverb',
  GeneralDisableVerb = 'general.Disableverb',
  GeneralSendMore = 'general.Send.more',
  GeneralShowVerb = 'general.Showverb',
  GeneralHideVerb = 'general.Hideverb',
  GeneralSaveVerb = 'general.Saveverb',
  GeneralCloseVerb = 'general.Closeverb',
  GeneralToken = 'general.Token',
  GeneralApplyVerb = 'general.Applyverb',
  GeneralUpdateVerb = 'general.Updateverb',
  GeneralLearnMore = 'general.Learn.more',
  GeneralDoYouWishToProceed = 'general.Do.you.wish.to.proceed',
  GeneralDays = 'general.Days',
  GeneralHours = 'general.Hours',
  GeneralMinutes = 'general.Minutes',
  GeneralSeconds = 'general.Seconds',
  GeneralFolders = 'general.Folders',
  GeneralShowMore = 'general.Show.more',

  //settings
  SettingsInfo = 'settings.info',
  SettingsGeneral = 'settings.general',
  SettingsNotifications = 'settings.notifications',
  SettingsTitle = 'settings.title',
  SettingsPersonalInfo = 'settings.personalInfo',
  SettingsPreferences = 'settings.preferences',
  SettingsTeamInfo = 'settings.teamInfo',
  SettingsTeamUpgrade = 'settings.teamUpgrade',
  SettingsTeamSubscription = 'settings.teamSubscription',
  SettingsIntegrations = 'settings.integrations',
  SettingsAppFeedback = 'settings.appFeedback',
  SettingsAccount = 'settings.account',
  SettingsAccountDelete = 'settings.account.delete',
  SettingsUILanguage = 'settings.interfaceLanguage',
  SettingsApplicationTheme = 'settings.applicationTheme',
  SettingsEditorTheme = 'settings.editorTheme',
  SettingsCodeBlockTheme = 'settings.codeblockTheme',
  SettingsEditorKeyMap = 'settings.editorKeyMap',
  SettingsEditorFontSize = 'settings.editorFontSize',
  SettingsEditorFontFamily = 'settings.editorFontFamily',
  SettingsLight = 'settings.light',
  SettingsDark = 'settings.dark',
  SettingsNotifFrequencies = 'settings.notificationsFrequency',
  SettingsIndentType = 'settings.indentType',
  SettingsShowEditorToolbar = 'settings.showEditorToolbar',
  SettingsShowEditorLineNumbers = 'settings.showEditorLineNumbers',
  SettingsIndentSize = 'settings.indentSize',
  SettingsSpace = 'settings.space',
  SettingsSpaceDelete = 'settings.space.delete',
  SettingsSpaceDeleteWarning = 'settings.space.delete.warning',
  ManagePreferences = 'manage.preferences',
  ManageProfile = 'manage.profile',
  ManageSpaceSettings = 'manage.space.settings',
  ManageTeamMembers = 'manage.team.members',
  ManageIntegrations = 'manage.integrations',

  CurrentMembers = 'members.current',
  AddMembers = 'members.add',
  MembersAccessLevel = 'members.access.level',
  TeamCreate = 'team.create',
  TeamCreateSubtitle = 'team.create.subtitle',
  TeamName = 'team.name',
  TeamDomain = 'team.domain',
  SpaceName = 'space.name',
  SpaceDomain = 'space.domain',
  TeamDomainShow = 'team.domain.show',
  TeamDomainWarning = 'team.domain.warning',

  InviteAddWithLink = 'invite.url',
  InviteEmail = 'invite.email',
  InviteByEmailMore = 'invite.more.by.email',
  InviteMembersDocAssignButton = 'invite.members.from.doc',
  InviteFailError = 'invite.failed.invites',
  InviteRoleDetails = 'invite.role.details.tooltip.',
  RoleMemberDescription = 'role.member.description',
  RoleAdminDescription = 'role.admin.description',
  RoleViewerDescription = 'role.viewer.description',
  RoleAdminPromote = 'role.admin.promote',
  RoleMemberChange = 'role.member.change',
  RoleViewerDemote = 'role.member.demote',
  TeamLeave = 'team.leave',
  TeamLeaveWarning = 'team.leave.warning',
  RemovingMember = 'role.member.remove',
  RemovingMemberWarning = 'role.member.remove.warning',
  CancelInvite = 'invite.cancel',
  CancelInviteOpenLinkMessage = 'invite.cancel.openlink.message',
  CancelInviteEmailMessage = 'invite.cancel.email.message',

  ExternalEntity = 'external.entity',
  ExternalEntityOpenInBrowser = 'external.entity.open.browser',
  ExternalEntityDescription = 'external.entity.description',
  ExternalEntityRequest = 'external.entity.request',

  CommunityFeedback = 'community.feedback',
  CommunityFeatureRequests = 'community.feature.requests',
  CommunityFeedbackSubtitle = 'community.feedback.subtitle',
  CommunityBugReport = 'community.bug.report',
  CommunityFeedbackSendError = 'community.feedback.send.error',
  CommunityFeedbackSendSuccess = 'community.feedback.send.success',
  CommunityFeedbackType = 'community.feedback.type',
  CommunityFeedbackFreeForm = 'community.feedback.freeform',

  ManageApi = 'manage.api',
  AccessTokens = 'tokens.access',
  CreateTokens = 'tokens.create',
  TokensName = 'tokens.name.placeholder',
  GenerateToken = 'tokens.generate',
  TokensDocumentation = 'tokens.documentation',

  SupportGuide = 'support.guide',
  SendUsAMessage = 'send.us.a.message',
  KeyboardShortcuts = 'keyboard.shortcuts',

  SettingsSubLimitTrialTitle = 'settings.sub.limit.trial.title',
  SettingsSubLimitTrialDate = 'settings.sub.limit.trial.date',
  SettingsSubLimitTrialUpgrade = 'settings.sub.limit.trial.upgrade',
  SettingsSubLimitTrialEnd = 'settings.sub.limit.trial.end',
  SettingsSubLimitUnderFreePlan = 'settings.sub.limit.free',

  PlanChoose = 'plan.choose',
  PlanDiscountUntil = 'plan.discount.until',
  PlanDiscountDetail = 'plan.discount.detail',
  PlanDiscountLabel = 'plan.discount.label',
  PlanDiscountCouponWarning = 'plan.discount.coupon.warning',
  PlanBusinessIntro = 'plan.business.intro',
  PlanBusinessLink = 'plan.business.link',
  PlanPerMember = 'plan.per.member',
  PlanPerMonth = 'plan.per.month',
  PlanFreePerk1 = 'plan.free.perk.1',
  PlanFreePerk2 = 'plan.free.perk.2',
  PlanFreePerk3 = 'plan.free.perk.3',
  PlanStoragePerk = 'plan.storage.perk',
  PlanStandardPerk1 = 'plan.standard.perk.1',
  PlanStandardPerk2 = 'plan.standard.perk.2',
  PlanStandardPerk3 = 'plan.standard.perk.3',
  PlanProPerk1 = 'plan.pro.perk.1',
  PlanProPerk2 = 'plan.pro.perk.2',
  PlanProPerk3 = 'plan.pro.perk.3',
  PlanTrial = 'plan.trial',
  PlanInTrial = 'plan.in.trial',
  PlanSizePerUpload = 'plan.upload.size',
  UpgradeSubtitle = 'plan.upgrade.subtitle',
  Viewers = 'viewers',
  Month = 'month',
  TotalMonthlyPrice = 'plan.total.monthly',
  PaymentMethod = 'payment.method',
  TrialWillBeStopped = 'trial.stopped',
  ApplyCoupon = 'coupon.apply',
  PromoCode = 'coupon.code',
  Subscribe = 'subscribe',
  PaymentMethodJpy = 'plan.method.jpy',
  UnlimitedViewers = 'viewers.unlimited',

  BillingActionRequired = 'billing.action.required',
  BillingHistory = 'billing.history',
  BillingHistoryCheck = 'billing.history.check',
  BillingCancelledAt = 'billing.cancelled.at',
  BillingToCard = 'billing.card.to',
  BillingEditCard = 'billing.card.edit',
  BillingEmail = 'billing.email',
  BillingEditEmail = 'billing.email.edit',
  BillingCanSeeThe = 'billing.can.see',
  BillingChangePlan = 'billing.plan.change',
  BillingUpdateCard = 'billing.card.update',
  BillingCurrentCard = 'billing.card.current',
  BillingUpdateEmail = 'billing.email.update',
  BillingCurrentEmail = 'billing.email.current',
  BillingChangeJCB = 'billing.card.jcb',
  BillingApplyPromoWarning = 'billing.promo.warning',
  BillingApplyPromo = 'billing.promo',

  BillingChangePlanDiscountStop = 'billing.plan.change.discount.stop',
  BillingChangePlanFreeDisclaimer = 'billing.plan.change.free.disclaimer',
  BillingChangePlanProDisclaimer = 'billing.plan.change.pro.disclaimer',
  BillingChangePlanStandardDisclaimer = 'billing.plan.change.standard.disclaimer',
  BillingChangePlanStripeProration = 'billing.plan.change.stripe.proration',

  DiscountModalTitle = 'modals.discount.title',
  DiscountModalAlreadySubscribed = 'modals.discount.subscribed',
  DiscountModalTimeRemaining = 'modals.discount.remaining',
  DiscountModalExpired = 'modals.discount.expired',

  FreeTrialModalTitle = 'modals.trial.title',
  FreeTrialModalBody = 'modals.trial.body',
  FreeTrialModalDisclaimer = 'modals.trial.disclaimer',
  FreeTrialModalCTA = 'modals.trial.cta',

  LogOut = 'log.out',
  CreateNewSpace = 'spaces.create',
  DownloadDesktopApp = 'modals.spaces.download',

  ToolbarTooltipsSpaces = 'toolbar.tooltips.spaces',
  ToolbarTooltipsTree = 'toolbar.tooltips.tree',
  ToolbarTooltipsDiscount = 'toolbar.tooltips.discount',

  GeneralBack = 'general.Back',

  FolderNamePlaceholder = 'placeholders.folder',
  DocTitlePlaceholder = 'placeholders.doc',

  SortLastUpdated = 'sort.last-updated',
  SortTitleAZ = 'sort.a-z',
  SortTitleZA = 'sort.z-a',
  SortDragAndDrop = 'sort.drag',
  CreateNewDoc = 'create.new.doc',
  CreateNewCanvas = 'create.new.canvas',
  UseATemplate = 'use.a.template',
  RenameFolder = 'Rename.folder',
  RenameDoc = 'Rename.doc',

  ModalsCreateNewFolder = 'modals.create.folder',
  ModalsCreateNewDocument = 'modals.create.doc',

  ModalsDeleteWorkspaceTitle = 'modals.workspaces.delete.title',
  ModalsDeleteWorkspaceDisclaimer = 'modals.workspaces.delete.disclaimer',

  ModalsDeleteDocFolderTitle = 'modals.docs.folders.delete.title',
  ModalsDeleteDocDisclaimer = 'modals.docs.delete.disclaimer',
  ModalsDeleteFolderDisclaimer = 'modals.folders.delete.disclaimer',

  ModalsWorkspaceCreateTitle = 'modals.workspaces.create.title',
  ModalsWorkspaceEditTitle = 'modals.workspaces.edit.title',

  ModalsWorkspaceMakePrivate = 'modals.workspaces.privatize',
  ModalsWorkspaceAccess = 'modals.workspaces.access',
  ModalsWorkspaceDefaultDisclaimer = 'modals.workspaces.default.disclaimer',
  ModalsWorkspacePublicDisclaimer = 'modals.workspaces.public.disclaimer',
  ModalsWorkspacePrivateDisclaimer = 'modals.workspaces.private.disclaimer',
  ModalsWorkspacePrivateOwner = 'modals.workspaces.private.owner',
  ModalsWorkspaceSetAccess = 'modals.workspaces.access.set',
  ModalsWorkspacesSetAccessMembers = 'modals.workspaces.access.members',
  ModalsWorkspacesWhoHasAcess = 'modals.workspaces.access.who',
  ModalsWorkspacesNonOwnerDisclaimer = 'modals.workspaces.access.nonowner',

  AttachmentsDeleteDisclaimer = 'attachments.delete.disclaimer',
  AttachmentsLimitDisclaimer = 'attachments.limit.disclaimer',
  AttachmentsPlanUpgradeDisclaimer = 'attachments.upgrade.disclaimer',
  AttachmentsUpgradeLink = 'attachments.upgrade.link',

  ModalsImportDestinationTitle = 'modals.import.destination.title',
  ModalsImportDestinationDisclaimer = 'modals.import.destination.disclaimer',
  ModalsImportDisclaimer = 'modals.import.disclaimer',

  ModalsSmartFolderCreateTitle = 'modals.sf.create.title',
  ModalsSmartFolderEditTitle = 'modals.sf.edit.title',
  ModalsSmartFolderPrivateDisclaimer = 'modals.sf.private.disclaimer',
  ModalsSmartFolderPublicDisclaimer = 'modals.sf.public.disclaimer',

  EditorToolbarTooltipHeader = 'editor.toolbar.tooltips.header',
  EditorToolbarTooltipAdmonition = 'editor.toolbar.tooltips.admonition',
  EditorToolbarTooltipCodefence = 'editor.toolbar.tooltips.codefence',
  EditorToolbarTooltipQuote = 'editor.toolbar.tooltips.quote',
  EditorToolbarTooltipList = 'editor.toolbar.tooltips.list',
  EditorToolbarTooltipNumberedList = 'editor.toolbar.tooltips.numberedlist',
  EditorToolbarTooltipTaskList = 'editor.toolbar.tooltips.tasklist',
  EditorToolbarTooltipBold = 'editor.toolbar.tooltips.bold',
  EditorToolbarTooltipItalic = 'editor.toolbar.tooltips.italic',
  EditorToolbarTooltipCode = 'editor.toolbar.tooltips.code',
  EditorToolbarTooltipLink = 'editor.toolbar.tooltips.link',
  EditorToolbarTooltipUpload = 'editor.toolbar.tooltips.upload',
  EditorToolbarTooltipTemplate = 'editor.toolbar.tooltips.template',
  EditorToolbarTooltipScrollSyncEnable = 'editor.toolbar.tooltips.scrollsync.enable',
  EditorToolbarTooltipScrollSyncDisable = 'editor.toolbar.tooltips.scrollsync.disable',

  EditorReconnectAttempt = 'editor.reconnect.attempt',
  EditorReconnectAttempt1 = 'editor.reconnect.attempt1',
  EditorReconnectAttempt2 = 'editor.reconnect.attempt2',
  EditorReconnectDisconnected = 'editor.reconnect.reconnect',
  EditorReconnectDisconnected1 = 'editor.reconnect.reconnect1',
  EditorReconnectDisconnected2 = 'editor.reconnect.reconnect2',
  EditorReconnectSyncing = 'editor.reconnect.syncing',
  EditorReconnectSyncing1 = 'editor.reconnect.syncing1',
  EditorReconnectSyncing2 = 'editor.reconnect.syncing2',

  DocSaveAsTemplate = 'doc.save.as.template',
  DocExportPdf = 'doc.export.pdf',
  DocExportMarkdown = 'doc.export.markdown',
  DocExportHtml = 'doc.export.html',

  FolderInfo = 'Folder.Info',
  DocInfo = 'Doc.Info',
  Assignees = 'Assignees',
  Unassigned = 'Unassigned',
  DueDate = 'Due.Date',
  AddDueDate = 'Add.due.date',
  AddALabel = 'Add.a.label',
  NoStatus = 'NoStatus',
  CreationDate = 'Creation.Date',
  UpdateDate = 'Update.Date',
  CreatedBy = 'Created.By',
  UpdatedBy = 'Updated.By',
  Contributors = 'Contributors',
  History = 'History',
  Share = 'Share',
  PublicSharing = 'Public.Sharing',
  PublicSharingDisclaimer = 'Public.Sharing.Disclaimer',
  SharingSettings = 'Sharing.settings',
  SharingRegenerateLink = 'regenerate.link',
  Regenerate = 'regenerate',
  PasswordProtect = 'password.protect',
  ExpirationDate = 'expiration.date',
  SeeFullHistory = 'history.see.full',
  SeeLimitedHistory = 'history.see.limited',
  ThreadsTitle = 'threads.title',
  ThreadPost = 'threads.Post',
  ThreadFullDocLabel = 'threads.fulldoc.label',
  ThreadCreate = 'threads.create',
  ThreadOpen = 'threads.open',
  ThreadClosed = 'threads.closed',
  ThreadOutdated = 'threads.outdated',
  ThreadReopen = 'threads.reopen',
  ThreadReplies = 'threads.replies',

  ModalsTemplatesDeleteDisclaimer = 'modals.templates.delete.disclaimer',
  ModalsTemplatesSearchEmpty = 'modals.templates.search.empty',
  ModalsTemplatesSelectTemplate = 'modals.templates.select.one',
  ModalsTemplatesUseInDoc = 'modals.templates.use.indoc',

  SettingsAccountDeleteWarning = 'settings.account.delete.warning',
  FormSelectImage = 'form.image.select',
  FormChangeImage = 'form.image.change',

  SettingsUserForum = 'settings.user.forum',

  SidebarViewOptions = 'sidebar.view.options',
  SidebarSettingsAndMembers = 'sidebar.settings.member',
  SidebarNewUserDiscount = 'sidebar.discount',
  GeneralOrdering = 'general.ordering',
  GeneralInbox = 'general.inbox',
  SettingsImportDescription = 'settings.import.description',

  GeneralPassword = 'general.password',

  CooperateTitle = 'cooperate.title',
  CooperateSubtitle = 'cooperate.subtitle',
  SpaceIntent = 'space.intent',
  SpaceIntentPersonal = 'space.intent.personal',
  SpaceIntentTeam = 'space.intent.team',
  PictureAdd = 'picture.add.verb',
  PictureChange = 'picture.change.verb',
  PlanViewersMembersIntro = 'plan.viewersmembers.intro',
  PlanViewersMembersLink = 'plan.viewersmembers.link',
  SeeRoleDetails = 'settings.roles.see.details',
  ViewerDisclaimerIntro = 'viewer.disclaimer.intro',
  ViewerDisclaimerOutro = 'viewer.disclaimer.outro',
  MemberRole = 'member.role',

  GeneralInvite = 'general.invite',
  SettingsRolesRestrictedTitle = 'settings.roles.restricted.title',
  SettingsRolesRestrictedDescription = 'settings.roles.restricted.description',

  GeneralDocuments = 'general.documents',
  RequestAskMemberRole = 'request.ask.member.role',
  RequestSent = 'request.requested',

  UploadLimit = 'upload.limit',
  OnboardingFolderSectionTitle = 'onboarding.folder.section.title',
  OnboardingFolderSectionDisclaimer = 'onboarding.folder.section.disclaimer',

  GeneralContent = 'general.content',
}

export type TranslationSource = {
  [key in lngKeys]: string
}
