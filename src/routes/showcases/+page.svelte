<script lang="ts">
  export let data: {
    localImages: string[];
  };

  const discordImages = [
    'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1455767046020136981/image.png?ex=699096f6&is=698f4576&hm=810831c3aaaaa25b9299f917ceaffb6aecf8697a692c5bf1634ad23c3cb74d5f&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1459811223313842300/image.png?ex=6990cce5&is=698f7b65&hm=725f41ff554c4488bb22feed88c646cc86122b74d2496cfd1524eb757764c338&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1461924271113633903/image.png?ex=699093d3&is=698f4253&hm=5d42876ad56c414c72f9edb4b8062a1ceb7e44898d1899a085f460a6d0b09db9&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1462607929864884284/IMG_4153.jpg?ex=69911648&is=698fc4c8&hm=427ef4a8a6c380e24b97a89e58b3ba5b9cd1bd98701a9bef33a69acad5de2e35&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1462906630080434176/image.png?ex=6990daf8&is=698f8978&hm=34bb762f886c0c7fa06f6021918c9a54aaffb8eac21c99cca168d120f948bf99&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1463720135134150812/image.png?ex=69912d9a&is=698fdc1a&hm=a64903480e24705d9b12987ee30a7a372a5d1f2e2c7bb800a726bf7d759487c8&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1456065243003224225/image.png?ex=699103ee&is=698fb26e&hm=d27c8800064953b1d0b006a2d171578d6aa7b96f80645d75c1670885e74988f4&'
  ];

  $: allImages = [...discordImages, ...data.localImages];
</script>

<svelte:head>
  <title>Server Showcases | Project Misfits</title>
  <meta
    name="description"
    content="Project Misfits server showcase gallery with official Discord screenshots and local showcase assets."
  />
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
  <h1 class="text-4xl font-black uppercase tracking-wide text-zinc-100">Server Showcases</h1>
  <p class="mt-3 max-w-3xl text-zinc-300">All official showcase images from Discord plus files in <code>assets/showcase/</code>.</p>

  <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {#if allImages.length === 0}
      <p class="rounded-md border border-zinc-700 bg-zinc-900/60 p-4 text-zinc-300 sm:col-span-2 lg:col-span-4">
        No showcase images found.
      </p>
    {/if}

    {#each allImages as image, i}
      <article class="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/70">
        <img src={image} alt={`Showcase image ${i + 1}`} class="h-44 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
      </article>
    {/each}
  </div>
</section>
