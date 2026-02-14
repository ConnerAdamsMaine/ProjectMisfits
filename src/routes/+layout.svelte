<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const socialImage =
    'https://cdn.discordapp.com/attachments/1449239897423740969/1454628884887896145/image.png?ex=69911037&is=698fbeb7&hm=c7a42842f30031f9d245f65638de55072ccfdf147ed9c42db4956b212e723e89&';
</script>

<svelte:head>
  <title>Project Misfits | Premium FiveM Realistic RP</title>
  <meta
    name="description"
    content="Project Misfits is a premium FiveM roleplay server focused on realistic RP, respectful community standards, custom vehicles, and rich map expansions."
  />
  <meta name="keywords" content="Project Misfits, FiveM, realistic RP, GTA roleplay, premium RP server" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Project Misfits | Premium FiveM Realistic RP" />
  <meta
    property="og:description"
    content="Join Project Misfits for immersive, staff-enforced realistic roleplay with high-quality content and a strong community."
  />
  <meta property="og:url" content="https://projectmisfits.example" />
  <meta property="og:image" content={socialImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Project Misfits | Premium FiveM Realistic RP" />
  <meta
    name="twitter:description"
    content="Premium realistic RP server with immersive systems, custom vehicles, and staff-backed standards."
  />
  <meta name="twitter:image" content={socialImage} />
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="min-h-screen bg-transparent text-zinc-100">
  <Nav />
  <main>
    <slot />
  </main>
  <Footer />
</div>
