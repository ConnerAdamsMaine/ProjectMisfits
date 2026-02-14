<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Opening, OpeningCategory } from '$lib/types';

  export let data: {
    openings: Opening[];
    categories: readonly OpeningCategory[];
    availableTags: string[];
    user: { id: string; username: string; avatarUrl: string | null } | null;
  };

  let selectedCategory: OpeningCategory | 'All' = 'All';
  let selectedTag = 'All';
  let sortNewest = true;
  let searchTerm = '';
  let selectedOpeningId = '';

  let showFiltersModal = false;
  let showAddPositionModal = false;
  let showAddPositionFormModal = false;

  let title = '';
  let description = '';
  let category: OpeningCategory = 'Business';
  let tags = '';
  let contact = '';
  let message = '';
  let error = '';
  let isPosting = false;
  let isClosing = false;

  const formatPosted = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleString();
  };

  const clearFilters = () => {
    selectedCategory = 'All';
    selectedTag = 'All';
    sortNewest = true;
    searchTerm = '';
  };

  const openAddPosition = () => {
    message = '';
    error = '';
    showAddPositionModal = true;
    showAddPositionFormModal = false;
  };

  const closeAllModals = () => {
    showFiltersModal = false;
    showAddPositionModal = false;
    showAddPositionFormModal = false;
  };

  const openFormModal = () => {
    if (!data.user) return;
    showAddPositionModal = false;
    showAddPositionFormModal = true;
  };

  $: normalizedSearch = searchTerm.trim().toLowerCase();

  $: visible = data.openings
    .filter((opening) => (selectedCategory === 'All' ? true : opening.category === selectedCategory))
    .filter((opening) => (selectedTag === 'All' ? true : opening.tags.includes(selectedTag)))
    .filter((opening) => {
      if (!normalizedSearch) return true;

      const haystack = [
        opening.title,
        opening.description,
        opening.contact,
        opening.category,
        opening.tags.join(' '),
        opening.authorName
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    })
    .slice()
    .sort((a, b) => {
      if (!sortNewest) return Number(new Date(a.createdAt)) - Number(new Date(b.createdAt));
      return Number(new Date(b.createdAt)) - Number(new Date(a.createdAt));
    });

  $: {
    if (visible.length === 0) {
      selectedOpeningId = '';
    } else if (!visible.some((opening) => opening.id === selectedOpeningId)) {
      selectedOpeningId = visible[0].id;
    }
  }

  $: selectedOpening = visible.find((opening) => opening.id === selectedOpeningId) ?? null;

  const submitOpening = async (event: SubmitEvent) => {
    event.preventDefault();
    message = '';
    error = '';

    if (!data.user) {
      error = 'Discord authentication is required before posting a position.';
      return;
    }

    if (isPosting) return;

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      error = 'Unable to submit form. Please refresh and try again.';
      return;
    }

    isPosting = true;

    try {
      const formData = new FormData(form);
      const response = await fetch('/api/openings', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        error = 'Unable to post opening. Check your input and try again.';
        return;
      }

      title = '';
      description = '';
      category = 'Business';
      tags = '';
      contact = '';
      showAddPositionFormModal = false;
      message = 'Position posted successfully.';
      await invalidateAll();
    } catch {
      error = 'Unable to post opening. Check your input and try again.';
    } finally {
      isPosting = false;
    }
  };

  const closeOpening = async () => {
    message = '';
    error = '';

    if (!selectedOpening || !data.user) return;
    if (selectedOpening.authorId !== data.user.id) {
      error = 'Only the author can close this opening.';
      return;
    }

    if (!browser || !window.confirm('Close this opening? It will be removed from the active board.')) {
      return;
    }

    if (isClosing) return;
    isClosing = true;

    try {
      const response = await fetch(`/api/openings/${selectedOpening.id}`, {
        method: 'DELETE'
      });

      if (response.status === 403) {
        error = 'Only the author can close this opening.';
        return;
      }

      if (response.status === 404) {
        error = 'Opening not found.';
        await invalidateAll();
        return;
      }

      if (!response.ok) {
        error = 'Unable to close opening right now. Please try again.';
        return;
      }

      message = 'Opening closed successfully.';
      await invalidateAll();
    } catch {
      error = 'Unable to close opening right now. Please try again.';
    } finally {
      isClosing = false;
    }
  };

  onMount(async () => {
    if (!browser) return;
    const { gsap } = await import('gsap');
    gsap.from('.indeed-panel', {
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power2.out'
    });
  });
</script>

<svelte:head>
  <title>Businesses & Departments | Project Misfits</title>
  <meta
    name="description"
    content="Browse and post Project Misfits openings for businesses, gangs, and departments with dynamic category and tag filtering."
  />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
  <header class="indeed-panel rounded-2xl border border-misfits-gray bg-misfits-charcoal/90 p-5 shadow-panel">
    <h1 class="text-3xl font-black uppercase tracking-wide text-zinc-100 sm:text-4xl">Businesses & Departments</h1>
    <p class="mt-2 text-zinc-300">Search roles, review details, and post new openings in one workflow.</p>

    <div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <input
        bind:value={searchTerm}
        type="search"
        placeholder="Job title, tag, category, or contact"
        class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
      />

      <button
        type="button"
        class="rounded-md border border-misfits-gray bg-zinc-900 px-4 py-2 font-semibold text-zinc-100 transition hover:border-misfits-red2"
        on:click={() => (showFiltersModal = true)}
      >
        Filters & Toggles
      </button>

      <button
        type="button"
        class="rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2"
        on:click={openAddPosition}
      >
        Add Position
      </button>
    </div>

    {#if message}
      <p class="mt-3 text-sm text-emerald-400">{message}</p>
    {/if}

    {#if error}
      <p class="mt-3 text-sm text-rose-400">{error}</p>
    {/if}
  </header>

  <div class="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
    <div class="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section class="indeed-panel rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-4 shadow-panel">
        <div class="mb-3 flex items-center justify-between gap-2">
          <h2 class="text-lg font-bold text-zinc-100">Results</h2>
          <span class="text-sm text-zinc-400">{visible.length} found</span>
        </div>

        {#if visible.length === 0}
          <p class="rounded-lg border border-zinc-700 bg-zinc-900/70 p-4 text-zinc-300">No openings match your current filters.</p>
        {:else}
          <div class="space-y-3">
            {#each visible as opening}
              <button
                type="button"
                class={`w-full rounded-xl border p-4 text-left transition ${
                  selectedOpeningId === opening.id
                    ? 'border-misfits-red2 bg-zinc-900/95 shadow-panel'
                    : 'border-zinc-700 bg-zinc-900/65'
                }`}
                on:click={() => (selectedOpeningId = opening.id)}
              >
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-lg font-bold text-zinc-100">{opening.title}</h3>
                  <span class="rounded bg-misfits-blood px-2 py-0.5 text-xs font-semibold uppercase text-zinc-100">{opening.category}</span>
                </div>
                <p class="mt-1 text-sm text-zinc-400">{opening.authorName} • {formatPosted(opening.createdAt)}</p>
                <p class="mt-3 text-sm text-zinc-300">{opening.description}</p>
              </button>
            {/each}
          </div>
        {/if}
      </section>

      <section class="indeed-panel rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Position Details</h2>

        {#if selectedOpening}
          <article class="mt-3 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-2xl font-black text-zinc-100">{selectedOpening.title}</h3>
              <span class="rounded bg-misfits-red1 px-2 py-1 text-xs font-semibold uppercase text-white">{selectedOpening.category}</span>
            </div>

            <p class="mt-3 text-zinc-300">{selectedOpening.description}</p>

            <div class="mt-4 flex flex-wrap gap-2">
              {#each selectedOpening.tags as tag}
                <span class="rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-200">#{tag}</span>
              {/each}
            </div>

            <div class="mt-4 space-y-1 text-sm text-zinc-300">
              <p><span class="text-zinc-400">Contact:</span> {selectedOpening.contact}</p>
              <p><span class="text-zinc-400">Posted by:</span> {selectedOpening.authorName}</p>
              <p><span class="text-zinc-400">Posted:</span> {formatPosted(selectedOpening.createdAt)}</p>
            </div>

            {#if data.user && selectedOpening.authorId === data.user.id}
              <button
                type="button"
                disabled={isClosing}
                class="mt-4 w-full rounded-md border border-rose-500/60 bg-rose-900/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                on:click={closeOpening}
              >
                {isClosing ? 'Closing...' : 'Close Opening'}
              </button>
            {/if}
          </article>
        {:else}
          <p class="mt-3 rounded-lg border border-zinc-700 bg-zinc-900/70 p-4 text-zinc-300">Select a listing to view details.</p>
        {/if}
      </section>
    </div>

    <aside class="indeed-panel rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel lg:sticky lg:top-24 lg:h-fit">
      <h2 class="text-lg font-bold text-zinc-100">Extra Settings</h2>

      <div class="mt-4 space-y-3 text-sm">
        <div class="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
          <p class="text-zinc-400">Active category</p>
          <p class="mt-1 font-semibold text-zinc-100">{selectedCategory === 'All' ? 'All categories' : selectedCategory}</p>
        </div>

        <div class="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
          <p class="text-zinc-400">Active tag</p>
          <p class="mt-1 font-semibold text-zinc-100">{selectedTag === 'All' ? 'All tags' : `#${selectedTag}`}</p>
        </div>

        <div class="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
          <p class="text-zinc-400">Sort mode</p>
          <p class="mt-1 font-semibold text-zinc-100">{sortNewest ? 'Newest first' : 'Oldest first'}</p>
        </div>

        <button
          type="button"
          class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 font-semibold text-zinc-100 transition hover:border-misfits-red2"
          on:click={clearFilters}
        >
          Reset Search & Filters
        </button>
      </div>
    </aside>
  </div>
</section>

{#if showFiltersModal}
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
    role="button"
    tabindex="0"
    aria-label="Close filters modal"
    on:click={closeAllModals}
    on:keydown={(event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') closeAllModals();
    }}
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-misfits-gray bg-misfits-charcoal p-5 shadow-panel"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xl font-bold text-zinc-100">Filters & Toggles</h2>
        <button type="button" class="text-sm text-zinc-300 hover:text-zinc-100" on:click={closeAllModals}>Close</button>
      </div>

      <div class="mt-4 space-y-3">
        <label class="block text-sm text-zinc-200">
          Category
          <select bind:value={selectedCategory} class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">
            <option value="All">All categories</option>
            {#each data.categories as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </label>

        <label class="block text-sm text-zinc-200">
          Tag
          <select bind:value={selectedTag} class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">
            <option value="All">All tags</option>
            {#each data.availableTags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </label>

        <label class="inline-flex items-center gap-2 text-sm text-zinc-200">
          <input bind:checked={sortNewest} type="checkbox" class="rounded border-misfits-gray bg-zinc-900" />
          Newest first
        </label>
      </div>

      <div class="mt-5 flex gap-2">
        <button
          type="button"
          class="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-misfits-red2"
          on:click={clearFilters}
        >
          Reset
        </button>
        <button
          type="button"
          class="rounded-md bg-misfits-red1 px-4 py-2 text-sm font-semibold text-white transition hover:bg-misfits-red2"
          on:click={() => (showFiltersModal = false)}
        >
          Apply
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showAddPositionModal}
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
    role="button"
    tabindex="0"
    aria-label="Close add position modal"
    on:click={closeAllModals}
    on:keydown={(event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') closeAllModals();
    }}
  >
    <div
      class="w-full max-w-md rounded-2xl border border-misfits-gray bg-misfits-charcoal p-5 shadow-panel"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <h2 class="text-xl font-bold text-zinc-100">Add Position</h2>
      <p class="mt-2 text-sm text-zinc-300">A Discord account is required before you can post a new position.</p>

      {#if data.user}
        <div class="mt-4 rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-sm text-zinc-200">
          <p>Connected as <span class="font-semibold">{data.user.username}</span></p>
        </div>

        <button
          type="button"
          class="mt-4 w-full rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2"
          on:click={openFormModal}
        >
          Continue to Position Form
        </button>
      {:else}
        <a
          href="/api/auth/discord"
          class="mt-4 inline-flex w-full justify-center rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2"
        >
          Login with Discord
        </a>
      {/if}

      <button type="button" class="mt-3 w-full text-sm text-zinc-400 underline hover:text-zinc-200" on:click={closeAllModals}>Cancel</button>
    </div>
  </div>
{/if}

{#if showAddPositionFormModal}
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
    role="button"
    tabindex="0"
    aria-label="Close position form modal"
    on:click={closeAllModals}
    on:keydown={(event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') closeAllModals();
    }}
  >
    <div
      class="w-full max-w-2xl rounded-2xl border border-misfits-gray bg-misfits-charcoal p-5 shadow-panel"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-xl font-bold text-zinc-100">New Position</h2>
        <button type="button" class="text-sm text-zinc-300 hover:text-zinc-100" on:click={closeAllModals}>Close</button>
      </div>

      <form method="POST" action="/api/openings" on:submit={submitOpening} class="mt-4 grid gap-3">
        <label class="block">
          <span class="mb-1 block text-sm text-zinc-200">Title</span>
          <input bind:value={title} name="title" required maxlength="80" class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm text-zinc-200">Description</span>
          <textarea
            bind:value={description}
            name="description"
            required
            maxlength="360"
            rows="4"
            class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
          ></textarea>
        </label>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm text-zinc-200">Category</span>
            <select bind:value={category} name="category" class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">
              {#each data.categories as c}
                <option value={c}>{c}</option>
              {/each}
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-sm text-zinc-200">Contact</span>
            <input
              bind:value={contact}
              name="contact"
              required
              maxlength="120"
              placeholder="Discord ticket channel or user"
              class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
            />
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-sm text-zinc-200">Tags (comma-separated)</span>
          <input
            bind:value={tags}
            name="tags"
            maxlength="120"
            placeholder="Night Shift, Mechanic, Full-time"
            class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
          />
        </label>

        <button
          type="submit"
          disabled={isPosting}
          class="w-full rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPosting ? 'Publishing...' : 'Publish Position'}
        </button>
      </form>

      {#if data.user}
        <form method="POST" action="/api/auth/logout" class="mt-3">
          <button type="submit" class="text-xs text-zinc-400 underline hover:text-zinc-200">Logout</button>
        </form>
      {/if}
    </div>
  </div>
{/if}
