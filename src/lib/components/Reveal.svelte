<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let root: HTMLElement | null = null;
  let visible = false;

  onMount(() => {
    if (!browser || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(root);

    return () => observer.disconnect();
  });
</script>

<div
  bind:this={root}
  class="translate-y-5 opacity-0 transition duration-700 ease-out"
  class:opacity-100={visible}
  class:translate-y-0={visible}
>
  <slot />
</div>
