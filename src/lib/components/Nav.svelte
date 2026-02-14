<script lang="ts">
  import { page } from '$app/stores';

  const baseLinks = [
    { href: '/', label: 'Home' },
    { href: '/showcases', label: 'Showcases' },
    { href: '/departments', label: 'Departments' },
    { href: '/rules', label: 'Rules' },
    { href: '/tos', label: 'ToS' }
  ];

  $: links = $page.data?.isAdmin ? [...baseLinks, { href: '/admin', label: 'Admin' }] : baseLinks;
</script>

<header class="sticky top-0 z-40 border-b border-misfits-gray/70 bg-misfits-black/85 backdrop-blur">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
    <a href="/" class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-100">Project Misfits</a>
    <ul class="flex items-center gap-1 sm:gap-2">
      {#each links as link}
        <li>
          <a
            href={link.href}
            class={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-misfits-gray/60 hover:text-white ${
              (link.href === '/' && $page.url.pathname === '/') ||
              (link.href !== '/' && $page.url.pathname.startsWith(link.href))
                ? 'bg-misfits-red1'
                : ''
            }`}
            aria-current={$page.url.pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</header>
