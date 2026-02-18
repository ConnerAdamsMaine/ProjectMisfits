<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Reveal from '$lib/components/Reveal.svelte';

  export let data: {
    content: {
      heroImage: string;
      heroBadge: string;
      heroTitle: string;
      heroTagline: string;
      primaryCtaLabel: string;
      primaryCtaHref: string;
      secondaryCtaLabel: string;
      secondaryCtaHref: string;
      sections: { title: string; text: string; image: string }[];
      galleryTitle: string;
    };
    gallery: string[];
  };

  onMount(async () => {
    if (!browser) return;
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');

    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-title', {
      y: 36,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.from('.hero-tagline', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out'
    });

    gsap.from('.hero-cta', {
      y: 14,
      opacity: 0,
      duration: 0.75,
      delay: 0.35,
      stagger: 0.1,
      ease: 'power2.out'
    });

    gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card) => {
      gsap.from(card, {
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 82%'
        }
      });
    });

    gsap.from('.gallery-shot', {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 82%'
      }
    });
  });
</script>

<svelte:head>
  <title>Project Misfits | Immersive Realistic FiveM RP</title>
</svelte:head>

<section class="relative isolate overflow-hidden border-b border-misfits-gray/70">
  <img src={data.content.heroImage} alt="Project Misfits in-game scene" class="absolute inset-0 h-full w-full object-cover" loading="eager" />
  <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,13,13,0.88),rgba(13,13,13,0.56)),linear-gradient(to_top,rgba(13,13,13,0.95),rgba(13,13,13,0.2))]"></div>
  <div class="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
    <p class="mb-4 text-sm uppercase tracking-[0.26em] text-zinc-300">{data.content.heroBadge}</p>
    <h1 class="hero-title max-w-3xl text-5xl font-black uppercase leading-tight text-zinc-100 sm:text-6xl md:text-7xl">
      {data.content.heroTitle}
    </h1>
    <p class="hero-tagline mt-5 max-w-2xl text-lg text-zinc-200 sm:text-xl">
      {data.content.heroTagline}
    </p>
    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <a
        class="hero-cta inline-flex items-center justify-center rounded-md bg-misfits-red1 px-6 py-3 text-base font-semibold text-white transition hover:bg-misfits-red2"
        href={data.content.primaryCtaHref}
        target="_blank"
        rel="noreferrer"
      >
        {data.content.primaryCtaLabel}
      </a>
      <a
        class="hero-cta inline-flex items-center justify-center rounded-md border border-zinc-500 bg-zinc-900/85 px-6 py-3 text-base font-semibold text-zinc-100 transition hover:border-zinc-300"
        href={data.content.secondaryCtaHref}
        target="_blank"
        rel="noreferrer"
      >
        {data.content.secondaryCtaLabel}
      </a>
    </div>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
  <div class="grid gap-5 md:grid-cols-2">
    {#each data.content.sections as section}
      <Reveal>
        <article class="feature-card relative h-full overflow-hidden rounded-xl border border-misfits-gray bg-misfits-charcoal/80 shadow-panel">
          <img src={section.image} alt={section.title} class="h-44 w-full object-cover" loading="lazy" />
          <div class="p-6">
            <h2 class="text-2xl font-bold text-zinc-100">{section.title}</h2>
            <p class="mt-3 leading-7 text-zinc-300">{section.text}</p>
          </div>
        </article>
      </Reveal>
    {/each}
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
  <div class="mb-5 flex items-end justify-between">
    <h2 class="text-2xl font-bold uppercase tracking-wide text-zinc-100">{data.content.galleryTitle}</h2>
  </div>
  <div class="gallery-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {#each data.gallery as image, i}
      <div class="gallery-shot overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/70">
        <img src={image} alt={`Project Misfits showcase ${i + 1}`} class="h-40 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
      </div>
    {/each}
  </div>
</section>
