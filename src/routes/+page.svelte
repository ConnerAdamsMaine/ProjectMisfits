<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Reveal from '$lib/components/Reveal.svelte';

  const heroImage =
    'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&';

  const sections = [
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
  ];

  const gallery = [
    'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1455767046020136981/image.png?ex=699096f6&is=698f4576&hm=810831c3aaaaa25b9299f917ceaffb6aecf8697a692c5bf1634ad23c3cb74d5f&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1459811223313842300/image.png?ex=6990cce5&is=698f7b65&hm=725f41ff554c4488bb22feed88c646cc86122b74d2496cfd1524eb757764c338&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1461924271113633903/image.png?ex=699093d3&is=698f4253&hm=5d42876ad56c414c72f9edb4b8062a1ceb7e44898d1899a085f460a6d0b09db9&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1462607929864884284/IMG_4153.jpg?ex=69911648&is=698fc4c8&hm=427ef4a8a6c380e24b97a89e58b3ba5b9cd1bd98701a9bef33a69acad5de2e35&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1462906630080434176/image.png?ex=6990daf8&is=698f8978&hm=34bb762f886c0c7fa06f6021918c9a54aaffb8eac21c99cca168d120f948bf99&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1463720135134150812/image.png?ex=69912d9a&is=698fdc1a&hm=a64903480e24705d9b12987ee30a7a372a5d1f2e2c7bb800a726bf7d759487c8&',
    'https://cdn.discordapp.com/attachments/1449239897423740969/1456065243003224225/image.png?ex=699103ee&is=698fb26e&hm=d27c8800064953b1d0b006a2d171578d6aa7b96f80645d75c1670885e74988f4&'
  ];

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
  <img src={heroImage} alt="Project Misfits in-game scene" class="absolute inset-0 h-full w-full object-cover" loading="eager" />
  <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,13,13,0.88),rgba(13,13,13,0.56)),linear-gradient(to_top,rgba(13,13,13,0.95),rgba(13,13,13,0.2))]"></div>
  <div class="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
    <p class="mb-4 text-sm uppercase tracking-[0.26em] text-zinc-300">Premium FiveM RP Experience</p>
    <h1 class="hero-title max-w-3xl text-5xl font-black uppercase leading-tight text-zinc-100 sm:text-6xl md:text-7xl">
      Project Misfits
    </h1>
    <p class="hero-tagline mt-5 max-w-2xl text-lg text-zinc-200 sm:text-xl">
      Immersive, realistic roleplay built for serious stories, disciplined standards, and natural community-driven conflict.
    </p>
    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <a
        class="hero-cta inline-flex items-center justify-center rounded-md bg-misfits-red1 px-6 py-3 text-base font-semibold text-white transition hover:bg-misfits-red2"
        href="https://cfx.re/join/89xrp4"
        target="_blank"
        rel="noreferrer"
      >
        Play Now
      </a>
      <a
        class="hero-cta inline-flex items-center justify-center rounded-md border border-zinc-500 bg-zinc-900/85 px-6 py-3 text-base font-semibold text-zinc-100 transition hover:border-zinc-300"
        href="https://discord.gg/projectmisfits"
        target="_blank"
        rel="noreferrer"
      >
        Join Discord
      </a>
    </div>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
  <div class="grid gap-5 md:grid-cols-2">
    {#each sections as section}
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
    <h2 class="text-2xl font-bold uppercase tracking-wide text-zinc-100">In-Server Showcase</h2>
  </div>
  <div class="gallery-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {#each gallery as image, i}
      <div class="gallery-shot overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/70">
        <img src={image} alt={`Project Misfits showcase ${i + 1}`} class="h-40 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
      </div>
    {/each}
  </div>
</section>
