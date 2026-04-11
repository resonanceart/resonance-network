// Copy strings for the claim flow — kept centralized so they can be tuned
// without hunting through components. Keep tone: warm, direct, inviting.

export const claimCopy = {
  pageHeader: 'Claim Your Profile',
  pageIntro: (artistName: string) =>
    `We built a profile for ${artistName} on Resonance Network. Claim it to make edits and take ownership.`,

  formHeading: 'Set up your account',
  emailLabel: 'Your email',
  emailHint: 'Where we\'ll send confirmations and future updates.',
  passwordLabel: 'Create a password',
  passwordHint: 'At least 8 characters.',
  confirmPasswordLabel: 'Confirm password',

  submitButton: 'Claim Profile',
  submittingButton: 'Claiming...',

  notYouLink: 'Not you? Let us know',
  expiryNote: (days: number) =>
    `This invite expires in ${days} day${days === 1 ? '' : 's'}.`,

  errors: {
    invite_not_found: 'This claim link is invalid or has already been used.',
    expired: 'This claim link has expired. Reach out and we\'ll send a new one.',
    already_claimed: 'This profile has already been claimed. Try signing in instead.',
    email_taken: 'An account with this email already exists. Try signing in instead.',
    password_mismatch: 'Passwords don\'t match. Try again.',
    password_too_short: 'Password must be at least 8 characters.',
    generic: 'Something went wrong. Please try again or contact us.',
  },

  welcomeBanner: (artistName: string) =>
    `Welcome, ${artistName}! Your profile is now yours — your saves go to this profile.`,

  homeLink: 'Go to home',
  loginLink: 'Sign in instead',
}

export const adminClaimCopy = {
  modalTitle: 'Create Claimable Profile',
  modalSubtitle: 'Build a profile for an artist. They can claim it later with a one-click link.',

  emailLabel: 'Artist email',
  emailHint: 'Where we\'ll send the claim invite. Required.',
  displayNameLabel: 'Display name',
  displayNameHint: 'How the artist\'s name will appear on their profile.',
  importUrlLabel: 'Import from URL',
  importUrlHint: 'Paste a link to their portfolio, Instagram, or website. We\'ll auto-fill the profile.',

  submitButton: 'Create & Import',
  submitButtonNoUrl: 'Create Empty Profile',
  submittingWithUrl: (url: string) => `Importing from ${url}...`,
  submittingNoUrl: 'Creating profile...',

  errors: {
    email_exists: 'An account with this email already exists.',
    already_claimable: 'A claimable profile with this email already exists.',
    missing_fields: 'Display name is required.',
    generic: 'Something went wrong. Please try again.',
  },

  cancelButton: 'Cancel',
}

export const claimableBannerCopy = {
  heading: 'Claimable Profile',
  icon: '🔐',
  subtext: (artistName: string) =>
    `This profile for ${artistName} is waiting to be claimed. Send the invite to let them take ownership.`,
  infoLine: 'Once claimed, the artist can edit, publish, and manage their profile.',

  sendButton: 'Send Claim Invite',
  resendButton: (lastSent: string) => `Resend Invite (last sent ${lastSent})`,
  deleteButton: 'Delete Claimable Profile',
  deleteConfirm: 'Delete this claimable profile? This cannot be undone.',

  sentToast: (email: string) => `Claim invite sent to ${email}.`,
  sendError: 'Failed to send claim invite. Please try again.',

  adminEditAsBanner: (artistName: string) =>
    `You're editing as ${artistName}. Changes will be saved to their profile.`,
  adminEditAsBack: 'Back to admin',
}

export const importOverwriteModal = {
  title: 'Import will overwrite your profile',
  intro: 'You\'re about to import data from an external website. This will replace your current:',
  bulletList: [
    'Display name and slug',
    'Bio',
    'Avatar and cover image',
    'Gallery items',
    'Social links',
    'Education / timeline',
  ],
  confirm: 'Are you sure you want to continue?',

  cancelButton: 'Cancel — keep my profile',
  overwriteButton: 'Overwrite with imported data',
  createNewButton: 'Create a new profile instead',

  createNewAdminHint: 'Use "Build Profile for Artist" in the admin dashboard instead.',
  createNewNonAdminHint:
    'This option is only available to admins — please cancel or choose one of the other actions.',
}

export const importAdminBlockBanner = {
  heading: 'You\'re signed in as an admin',
  body:
    'Importing into your own profile would overwrite the Resonance Art Collective account. To build a profile for another artist, use "Build Profile for Artist" in /admin.',
  continueHint:
    'To continue importing into your own profile anyway, click below — you\'ll get a confirmation prompt.',
  continueButton: 'Continue anyway',
  goToAdminButton: 'Go to admin dashboard',
}
