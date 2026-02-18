export const defaultDiscordShowcaseImages = [
  'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1455767046020136981/image.png?ex=699096f6&is=698f4576&hm=810831c3aaaaa25b9299f917ceaffb6aecf8697a692c5bf1634ad23c3cb74d5f&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1459811223313842300/image.png?ex=6990cce5&is=698f7b65&hm=725f41ff554c4488bb22feed88c646cc86122b74d2496cfd1524eb757764c338&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1461924271113633903/image.png?ex=699093d3&is=698f4253&hm=5d42876ad56c414c72f9edb4b8062a1ceb7e44898d1899a085f460a6d0b09db9&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1462607929864884284/IMG_4153.jpg?ex=69911648&is=698fc4c8&hm=427ef4a8a6c380e24b97a89e58b3ba5b9cd1bd98701a9bef33a69acad5de2e35&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1462906630080434176/image.png?ex=6990daf8&is=698f8978&hm=34bb762f886c0c7fa06f6021918c9a54aaffb8eac21c99cca168d120f948bf99&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1463720135134150812/image.png?ex=69912d9a&is=698fdc1a&hm=a64903480e24705d9b12987ee30a7a372a5d1f2e2c7bb800a726bf7d759487c8&',
  'https://cdn.discordapp.com/attachments/1449239897423740969/1456065243003224225/image.png?ex=699103ee&is=698fb26e&hm=d27c8800064953b1d0b006a2d171578d6aa7b96f80645d75c1670885e74988f4&'
] as const;

export const defaultHomeContent = {
  heroImage:
    'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&',
  heroBadge: 'Premium FiveM RP Experience',
  heroTitle: 'Project Misfits',
  heroTagline:
    'Immersive, realistic roleplay built for serious stories, disciplined standards, and natural community-driven conflict.',
  primaryCtaLabel: 'Play Now',
  primaryCtaHref: 'https://cfx.re/join/89xrp4',
  secondaryCtaLabel: 'Join Discord',
  secondaryCtaHref: 'https://discord.gg/projectmisfits',
  sections: [
    {
      title: 'Expanded Map With Premium MLOs',
      text: 'Detailed interiors, unique social hubs, and district-specific activity spaces built to support long-form character arcs.',
      image:
        'https://cdn.discordapp.com/attachments/1449239897423740969/1455767046020136981/image.png?ex=699096f6&is=698f4576&hm=810831c3aaaaa25b9299f917ceaffb6aecf8697a692c5bf1634ad23c3cb74d5f&'
    },
    {
      title: 'High-Quality Custom Vehicles',
      text: 'Balanced, high-fidelity vehicle roster with handling tuned for realistic street, highway, and emergency operations.',
      image:
        'https://cdn.discordapp.com/attachments/1449239897423740969/1459811223313842300/image.png?ex=6990cce5&is=698f7b65&hm=725f41ff554c4488bb22feed88c646cc86122b74d2496cfd1524eb757764c338&'
    },
    {
      title: 'Staff-Enforced Realistic RP',
      text: 'Clear standards, active moderation, and consistent rule enforcement that protects immersion and story quality.',
      image:
        'https://cdn.discordapp.com/attachments/1449239897423740969/1461924271113633903/image.png?ex=699093d3&is=698f4253&hm=5d42876ad56c414c72f9edb4b8062a1ceb7e44898d1899a085f460a6d0b09db9&'
    },
    {
      title: 'Respectful, Natural Community',
      text: 'A mature environment focused on collaboration, believable interaction, and character-driven outcomes.',
      image:
        'https://cdn.discordapp.com/attachments/1449239897423740969/1462607929864884284/IMG_4153.jpg?ex=69911648&is=698fc4c8&hm=427ef4a8a6c380e24b97a89e58b3ba5b9cd1bd98701a9bef33a69acad5de2e35&'
    }
  ],
  galleryTitle: 'In-Server Showcase'
} as const;

export const defaultShowcasesContent = {
  title: 'Server Showcases',
  description: 'All official showcase images from Discord plus files in assets/showcase/.'
} as const;

export const defaultDepartmentsContent = {
  title: 'Businesses & Departments',
  description: 'Search roles, review details, and post new openings in one workflow.',
  searchPlaceholder: 'Job title, tag, category, or contact',
  addPositionLabel: 'Add Position'
} as const;

export const defaultRulesContent = {
  title: 'Official Rules',
  description: 'Complete server rulebook and punishment policy.',
  rulesText: `OFFICIAL RULES\n\nLast revised on 1/19/25 by Managament\n\nRules are configurable from the admin panel.`
} as const;

export const defaultTosContent = {
  title: 'Terms of Service',
  description: 'Read and follow these terms before participating in Project Misfits.',
  sections: [
    {
      title: 'Age Restrictions',
      body: 'This server is strictly 18+, and all members must be of legal age to remain within our server, and participate within any of our events or leagues. Age verification may be required.'
    },
    {
      title: 'Discord Terms and Guidelines',
      body: 'Discord Terms of Service and Community Guidelines must be followed within this server.',
      links: [
        'https://discord.com/terms',
        'https://discord.com/guidelines'
      ]
    },
    {
      title: 'Be Respectful - Zero Tolerance for Toxicity',
      body: 'Harassment, bullying, hate speech, slurs, discrimination, or targeted attacks based on race, ethnicity, gender, sexuality, religion, or anything else is not permitted within this server.'
    },
    {
      title: 'No Spamming | Advertisements',
      body: 'Spamming unnecessary messages or pings within chats is not permitted, and can result in removal of related permissions. Unsolicited advertising without approval is strictly prohibited and can result in permanent removal from the server without appeal.'
    },
    {
      title: 'No NSFW Content',
      body: 'This is a community server that fosters a family-friendly environment. NSFW content is not permitted.'
    },
    {
      title: 'Respect Privacy and Safety',
      body: "DDoS'ing, DoX'ing, leaking personal information, making harmful threats (verbal or physical), or any other form of invasive behavior is not permitted."
    },
    {
      title: 'Remain Legal',
      body: 'Sharing or discussing cheats, hacks, pirated games, cracked accounts, or any other illegal content within this server is not permitted.'
    }
  ],
  footerPrimary:
    'Failing to adhere to any of the above listed guidelines could result in temporary, even permanent, removal from the server.',
  footerSecondary:
    'If you have any questions or concerns, or need to report one of the above being broken, please open a support ticket.'
} as const;

export const pageContentDefaults = {
  '/': defaultHomeContent,
  '/showcases': defaultShowcasesContent,
  '/departments': defaultDepartmentsContent,
  '/rules': defaultRulesContent,
  '/tos': defaultTosContent
} as const;

export type PageContentPath = keyof typeof pageContentDefaults;
