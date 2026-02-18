<script lang="ts">
  export let data: {
    content: {
      title: string;
      description: string;
    };
    categories: {
      name: string;
      items: {
        id: string;
        imageUrl: string;
        title: string | null;
        description: string | null;
      }[];
    }[];
  };
</script>

<svelte:head>
  <title>Server Showcases | Project Misfits</title>
  <meta
    name="description"
    content="Project Misfits server showcase gallery with official Discord screenshots and local showcase assets."
  />
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
  <h1 class="text-4xl font-black uppercase tracking-wide text-zinc-100">{data.content.title}</h1>
  <p class="mt-3 max-w-3xl text-zinc-300">{data.content.description}</p>

  {#if data.categories.length === 0}
    <div class="mt-8 rounded-md border border-zinc-700 bg-zinc-900/60 p-4 text-zinc-300">
      No showcase images found.
    </div>
  {/if}

  {#each data.categories as category}
    <section class="mt-8">
      <h2 class="text-xl font-bold uppercase tracking-wide text-zinc-100">{category.name}</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {#if category.items.length === 0}
          <p class="rounded-md border border-zinc-700 bg-zinc-900/60 p-4 text-zinc-300 sm:col-span-2 lg:col-span-4">
            No images in this category.
          </p>
        {/if}
        {#each category.items as item, i}
          <article class="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/70">
            <img src={item.imageUrl} alt={item.title ?? `Showcase image ${i + 1}`} class="h-44 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
            {#if item.title || item.description}
              <div class="border-t border-zinc-700/70 px-3 py-2">
                {#if item.title}
                  <p class="text-sm font-semibold text-zinc-100">{item.title}</p>
                {/if}
                {#if item.description}
                  <p class="mt-1 text-xs text-zinc-300">{item.description}</p>
                {/if}
              </div>
            {/if}
          </article>
        {/each}
      </div>
    </section>
  {/each}
</section>
