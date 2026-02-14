<script lang="ts">
  export let data: {
    users: { id: string; username: string; avatarUrl: string | null; updatedAt: string }[];
    selectedUserId: string;
    permissions: {
      userId: string;
      resource: string;
      action: string;
      grantedAt: string;
      expiresAt: string | null;
      grantedBy: string | null;
    }[];
    apiKeys: {
      id: string;
      keyType: 'super' | 'admin';
      userId: string | null;
      name: string;
      createdAt: string;
      expiresAt: string | null;
      lastUsedAt: string | null;
      isActive: boolean;
    }[];
    pagePaths: readonly string[];
    stats: {
      period: '24h' | '7d' | '30d';
      totalRequests: number;
      requestsByEndpoint: Record<string, number>;
      requestsByUser: Record<string, number>;
      errorRate: number;
      avgResponseTimeMs: number;
    };
  };

  export let form:
    | {
        success?: string;
        error?: string;
        newApiKey?: string;
        newApiKeyId?: string;
        newApiKeyExpiresAt?: string | null;
      }
    | undefined;

  $: permissionSet = new Set(data.permissions.map((p) => `${p.resource}::${p.action}`));

  const formatDate = (value: string | null) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
  };

  $: topEndpoints = Object.entries(data.stats.requestsByEndpoint).slice(0, 5);
  $: topUsers = Object.entries(data.stats.requestsByUser).slice(0, 5);
</script>

<svelte:head>
  <title>Admin | Project Misfits</title>
  <meta name="description" content="Project Misfits admin controls for permissions and integrations." />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
  <header class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/90 p-6 shadow-panel">
    <h1 class="text-3xl font-black uppercase tracking-wide text-zinc-100">Admin Control Panel</h1>
    <p class="mt-2 text-zinc-300">Manage fine-grained permissions, per-page access, and integration API keys.</p>

    {#if form?.success}
      <p class="mt-3 text-sm text-emerald-400">{form.success}</p>
    {/if}
    {#if form?.error}
      <p class="mt-3 text-sm text-rose-400">{form.error}</p>
    {/if}
    {#if form?.newApiKey}
      <div class="mt-4 rounded-lg border border-amber-600/50 bg-amber-900/20 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-amber-300">New API Key (shown once)</p>
        <p class="mt-2 break-all rounded bg-zinc-950/60 p-2 font-mono text-sm text-amber-200">{form.newApiKey}</p>
        <p class="mt-2 text-xs text-zinc-300">Key ID: {form.newApiKeyId} | Expires: {formatDate(form.newApiKeyExpiresAt ?? null)}</p>
      </div>
    {/if}
  </header>

  <section class="mt-6 rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-bold text-zinc-100">API Stats</h2>
      <form method="GET" class="flex items-center gap-2">
        <input type="hidden" name="user" value={data.selectedUserId} />
        <label class="text-sm text-zinc-300" for="period">Period</label>
        <select
          id="period"
          name="period"
          class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
          on:change={(event) => (event.currentTarget as HTMLSelectElement).form?.requestSubmit()}
        >
          <option value="24h" selected={data.stats.period === '24h'}>24h</option>
          <option value="7d" selected={data.stats.period === '7d'}>7d</option>
          <option value="30d" selected={data.stats.period === '30d'}>30d</option>
        </select>
      </form>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
        <p class="text-xs uppercase tracking-wide text-zinc-400">Total Requests</p>
        <p class="mt-1 text-2xl font-black text-zinc-100">{data.stats.totalRequests}</p>
      </div>
      <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
        <p class="text-xs uppercase tracking-wide text-zinc-400">Error Rate</p>
        <p class="mt-1 text-2xl font-black text-zinc-100">{(data.stats.errorRate * 100).toFixed(2)}%</p>
      </div>
      <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
        <p class="text-xs uppercase tracking-wide text-zinc-400">Avg Response</p>
        <p class="mt-1 text-2xl font-black text-zinc-100">{data.stats.avgResponseTimeMs.toFixed(2)}ms</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 lg:grid-cols-2">
      <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
        <p class="text-xs uppercase tracking-wide text-zinc-400">Top Endpoints</p>
        <div class="mt-2 space-y-1 text-sm">
          {#if topEndpoints.length === 0}
            <p class="text-zinc-400">No requests in selected period.</p>
          {/if}
          {#each topEndpoints as [endpoint, count]}
            <p class="flex items-center justify-between gap-2 text-zinc-200">
              <span class="font-mono text-xs">{endpoint}</span>
              <span>{count}</span>
            </p>
          {/each}
        </div>
      </div>
      <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
        <p class="text-xs uppercase tracking-wide text-zinc-400">Top Users</p>
        <div class="mt-2 space-y-1 text-sm">
          {#if topUsers.length === 0}
            <p class="text-zinc-400">No user activity in selected period.</p>
          {/if}
          {#each topUsers as [userId, count]}
            <p class="flex items-center justify-between gap-2 text-zinc-200">
              <span class="font-mono text-xs">{userId}</span>
              <span>{count}</span>
            </p>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <div class="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
    <aside class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
      <h2 class="text-lg font-bold text-zinc-100">Users</h2>
      <form method="GET" class="mt-3">
        <input
          type="search"
          name="q"
          placeholder="Search username or id"
          class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"
        />
      </form>

      <div class="mt-3 max-h-[28rem] space-y-2 overflow-auto pr-1">
        {#each data.users as user}
          <a
            href={`/admin?user=${encodeURIComponent(user.id)}`}
            class={`block rounded-lg border p-3 text-sm transition ${
              data.selectedUserId === user.id
                ? 'border-misfits-red2 bg-zinc-900/95'
                : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-500'
            }`}
          >
            <p class="font-semibold text-zinc-100">{user.username}</p>
            <p class="mt-1 break-all text-xs text-zinc-400">{user.id}</p>
          </a>
        {/each}
      </div>
    </aside>

    <div class="space-y-5">
      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Grant Permission</h2>
        <form method="POST" action="?/grantPermission" class="mt-3 grid gap-3 md:grid-cols-4">
          <input type="hidden" name="userId" value={data.selectedUserId} />
          <label class="block text-sm text-zinc-200 md:col-span-2">
            Resource
            <input name="resource" required placeholder="openings / admin_dashboard / page:/departments" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Action
            <input name="action" required placeholder="read / write / delete / view" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Expires (days)
            <input name="expiresInDays" type="number" min="1" max="3650" placeholder="Optional" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <button type="submit" class="md:col-span-4 rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2">
            Grant Permission
          </button>
        </form>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Per-Page Access (view)</h2>
        <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {#each data.pagePaths as path}
            {@const key = `page:${path}::view`}
            {@const hasPermission = permissionSet.has(key)}
            <form method="POST" action={hasPermission ? '?/revokePermission' : '?/grantPermission'} class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
              <input type="hidden" name="userId" value={data.selectedUserId} />
              <input type="hidden" name="resource" value={`page:${path}`} />
              <input type="hidden" name="action" value="view" />
              <p class="text-sm font-semibold text-zinc-100">{path}</p>
              <p class="mt-1 text-xs text-zinc-400">resource: page:{path}</p>
              <button
                type="submit"
                class={`mt-3 w-full rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  hasPermission
                    ? 'border border-rose-500/60 bg-rose-900/30 text-rose-200 hover:bg-rose-900/40'
                    : 'bg-misfits-red1 text-white hover:bg-misfits-red2'
                }`}
              >
                {hasPermission ? 'Revoke Access' : 'Grant Access'}
              </button>
            </form>
          {/each}
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Current Permissions</h2>
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-700 text-left text-zinc-300">
                <th class="px-2 py-2">Resource</th>
                <th class="px-2 py-2">Action</th>
                <th class="px-2 py-2">Expires</th>
                <th class="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {#if data.permissions.length === 0}
                <tr><td colspan="4" class="px-2 py-4 text-zinc-400">No permissions found.</td></tr>
              {/if}
              {#each data.permissions as permission}
                <tr class="border-b border-zinc-800/70 text-zinc-200">
                  <td class="px-2 py-2 font-mono text-xs">{permission.resource}</td>
                  <td class="px-2 py-2">{permission.action}</td>
                  <td class="px-2 py-2">{formatDate(permission.expiresAt)}</td>
                  <td class="px-2 py-2">
                    <form method="POST" action="?/revokePermission">
                      <input type="hidden" name="userId" value={permission.userId} />
                      <input type="hidden" name="resource" value={permission.resource} />
                      <input type="hidden" name="action" value={permission.action} />
                      <button type="submit" class="rounded border border-rose-500/60 bg-rose-900/30 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-900/40">
                        Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">API Keys</h2>

        <form method="POST" action="?/createApiKey" class="mt-3 grid gap-3 md:grid-cols-3">
          <input type="hidden" name="userId" value={data.selectedUserId} />
          <label class="block text-sm text-zinc-200 md:col-span-2">
            Key Name
            <input name="name" required placeholder="Admin: user#1234" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Expires (days)
            <input name="expiresInDays" type="number" min="1" max="3650" placeholder="Optional" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <button type="submit" class="md:col-span-3 rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2">
            Create Admin Key
          </button>
        </form>

        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-700 text-left text-zinc-300">
                <th class="px-2 py-2">Name</th>
                <th class="px-2 py-2">Status</th>
                <th class="px-2 py-2">Expires</th>
                <th class="px-2 py-2">Last Used</th>
                <th class="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {#if data.apiKeys.length === 0}
                <tr><td colspan="5" class="px-2 py-4 text-zinc-400">No API keys found.</td></tr>
              {/if}
              {#each data.apiKeys as key}
                <tr class="border-b border-zinc-800/70 text-zinc-200">
                  <td class="px-2 py-2">{key.name}</td>
                  <td class="px-2 py-2">{key.isActive ? 'Active' : 'Revoked'}</td>
                  <td class="px-2 py-2">{formatDate(key.expiresAt)}</td>
                  <td class="px-2 py-2">{formatDate(key.lastUsedAt)}</td>
                  <td class="px-2 py-2">
                    {#if key.isActive}
                      <form method="POST" action="?/revokeApiKey">
                        <input type="hidden" name="keyId" value={key.id} />
                        <button type="submit" class="rounded border border-rose-500/60 bg-rose-900/30 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-900/40">
                          Revoke
                        </button>
                      </form>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</section>
