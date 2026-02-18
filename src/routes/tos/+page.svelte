<script lang="ts">
  export let data: {
    content: {
      title: string;
      description: string;
      sections: { title: string; body: string; links?: string[] }[];
      footerPrimary: string;
      footerSecondary: string;
    };
  };

  const sections: { title: string; body: string; links?: string[] }[] = [
    {
      title: 'Age Restrictions',
      body: 'This server is strictly 18+, and all members must be of legal age to remain within our server, and participate within any of our events or leagues. Age verification may be required.'
    },
    {
      title: 'Discord Terms and Guidelines',
      body: 'Discord Terms of Service and Community Guidelines must be followed within this server.'
    },
    {
      title: 'Be Respectful - Zero Tolerance for Toxicity',
      body: 'Harassment, bullying, hate speech, slurs, discrimination, or targeted attacks based on race, ethnicity, gender, sexuality, religion, or anything else is not permitted within this server.'
    },
    {
      title: 'No Spamming | Advertisements',
      body: 'Spamming unnecessary messages or pings within chats is not permitted, and can result in removal of related permissions. Unsolicited advertising (excessive pings, raid invites, mass-linking, etc.) without approval is strictly prohibited and can result in permanent removal from the server without appeal.'
    },
    {
      title: 'No NSFW Content',
      body: 'This is a community server that fosters a family-friendly environment. NSFW content (nudity, sexual content, graphic violence, or offensive language) is not permitted.'
    },
    {
      title: 'Respect Privacy and Safety',
      body: "DDoS'ing, DoX'ing, leaking personal information, making harmful threats (verbal or physical), or any other form of invasive behavior is not permitted."
    },
    {
      title: 'Remain Legal',
      body: 'Sharing or discussing cheats, hacks, pirated games, cracked accounts, or any other illegal content within this server is not permitted.'
    }
  ];
</script>

<svelte:head>
  <title>Terms of Service | Project Misfits</title>
  <meta
    name="description"
    content="Project Misfits Terms of Service covering age, conduct, safety, Discord policy compliance, and enforcement."
  />
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-14 sm:px-6">
  <h1 class="text-4xl font-black uppercase tracking-wide text-zinc-100">{data.content.title}</h1>
  <p class="mt-3 text-zinc-300">{data.content.description}</p>

  <div class="mt-8 space-y-4">
    {#each (data.content.sections?.length ? data.content.sections : sections) as section}
      <details class="rounded-lg border border-misfits-gray bg-misfits-charcoal/80 p-5 open:bg-misfits-charcoal" open>
        <summary class="cursor-pointer list-none text-lg font-semibold text-zinc-100">{section.title}</summary>
        <p class="mt-3 leading-7 text-zinc-300">{section.body}</p>

        {#if section.links?.length}
          <div class="mt-3 space-y-2 text-sm">
            {#each section.links as link}
              <p>
                <a class="text-misfits-red2 underline hover:text-red-300" href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </p>
            {/each}
          </div>
        {/if}
      </details>
    {/each}
  </div>

  <div class="mt-8 rounded-lg border border-misfits-gray bg-zinc-900/80 p-5">
    <p class="leading-7 text-zinc-200">
      {data.content.footerPrimary}
    </p>
    <p class="mt-3 leading-7 text-zinc-300">
      {data.content.footerSecondary}
    </p>
  </div>
</section>
