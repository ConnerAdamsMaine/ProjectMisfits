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
    permissionActions: readonly string[];
    adminResources: readonly string[];
    pageContentDefaults: Record<string, unknown>;
    pageContent: { pagePath: string; content: unknown; updatedAt: string }[];
    allOpenings: {
      id: string;
      title: string;
      description: string;
      category: 'Business' | 'Gang' | 'Department';
      tags: string[];
      contact: string;
      authorId: string;
      authorName: string;
      createdAt: string;
      updatedAt: string;
      closedAt: string | null;
    }[];
    showcaseItems: {
      id: string;
      imageUrl: string;
      category: string;
      title: string | null;
      description: string | null;
      ownerId: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }[];
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
  $: pageContentByPath = new Map(data.pageContent.map((entry) => [entry.pagePath, entry]));

  const formatDate = (value: string | null) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
  };

  const toJson = (value: unknown) => JSON.stringify(value, null, 2);
  const formatTags = (tags: string[]) => tags.join(', ');

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
    <p class="mt-2 text-zinc-300">Manage page content, showcase categories, department posts, and Discord ID permissions.</p>

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
        <input type="search" name="q" placeholder="Search username or id" class="w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
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
            <input name="resource" required placeholder="page:/rules / departments:posts" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Action
            <input name="action" required placeholder="view / read / write / modify / delete" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
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
        <h2 class="text-lg font-bold text-zinc-100">Per-Page Permission Matrix</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          {#each data.pagePaths as path}
            <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
              <p class="text-sm font-semibold text-zinc-100">{path}</p>
              <p class="mt-1 text-xs text-zinc-400">resource: page:{path}</p>
              <div class="mt-3 grid gap-2 sm:grid-cols-2">
                {#each data.permissionActions as action}
                  {@const key = `page:${path}::${action}`}
                  {@const hasPermission = permissionSet.has(key)}
                  <form method="POST" action={hasPermission ? '?/revokePermission' : '?/grantPermission'}>
                    <input type="hidden" name="userId" value={data.selectedUserId} />
                    <input type="hidden" name="resource" value={`page:${path}`} />
                    <input type="hidden" name="action" value={action} />
                    <button
                      type="submit"
                      class={`w-full rounded-md px-3 py-1.5 text-xs font-semibold uppercase transition ${
                        hasPermission
                          ? 'border border-rose-500/60 bg-rose-900/30 text-rose-200 hover:bg-rose-900/40'
                          : 'bg-misfits-red1 text-white hover:bg-misfits-red2'
                      }`}
                    >
                      {hasPermission ? `Revoke ${action}` : `Grant ${action}`}
                    </button>
                  </form>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Feature Permission Matrix</h2>
        <div class="mt-3 space-y-3">
          {#each data.adminResources as resource}
            <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
              <p class="text-sm font-semibold text-zinc-100">{resource}</p>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                {#each data.permissionActions.filter((action) => action !== 'view') as action}
                  {@const key = `${resource}::${action}`}
                  {@const hasPermission = permissionSet.has(key)}
                  <form method="POST" action={hasPermission ? '?/revokePermission' : '?/grantPermission'}>
                    <input type="hidden" name="userId" value={data.selectedUserId} />
                    <input type="hidden" name="resource" value={resource} />
                    <input type="hidden" name="action" value={action} />
                    <button
                      type="submit"
                      class={`w-full rounded-md px-3 py-1.5 text-xs font-semibold uppercase transition ${
                        hasPermission
                          ? 'border border-rose-500/60 bg-rose-900/30 text-rose-200 hover:bg-rose-900/40'
                          : 'bg-misfits-red1 text-white hover:bg-misfits-red2'
                      }`}
                    >
                      {hasPermission ? `Revoke ${action}` : `Grant ${action}`}
                    </button>
                  </form>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Page Text Configuration (JSON)</h2>
        <p class="mt-2 text-sm text-zinc-300">Edit text payloads for each page. This overrides defaults used by the route.</p>
        <div class="mt-4 space-y-4">
          {#each Object.keys(data.pageContentDefaults) as pagePath}
            {@const current = pageContentByPath.get(pagePath)?.content ?? data.pageContentDefaults[pagePath]}
            <form method="POST" action="?/updatePageContent" class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
              <input type="hidden" name="pagePath" value={pagePath} />
              <div class="mb-2 flex items-center justify-between gap-2">
                <p class="font-mono text-sm text-zinc-100">{pagePath}</p>
                <p class="text-xs text-zinc-400">Updated: {formatDate(pageContentByPath.get(pagePath)?.updatedAt ?? null)}</p>
              </div>
              <textarea name="contentJson" rows="12" class="w-full rounded-md border-misfits-gray bg-zinc-950 text-xs text-zinc-100">{toJson(current)}</textarea>
              <button type="submit" class="mt-2 rounded-md bg-misfits-red1 px-4 py-2 text-sm font-semibold text-white transition hover:bg-misfits-red2">
                Save {pagePath}
              </button>
            </form>
          {/each}
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Showcase Image Metadata</h2>

        <form method="POST" action="?/upsertShowcaseItem" class="mt-3 grid gap-3 md:grid-cols-2">
          <label class="block text-sm text-zinc-200 md:col-span-2">
            Image URL
            <input name="imageUrl" required placeholder="/api/showcase/file.png or https://..." class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Category
            <input name="category" required placeholder="Discord / Events / Departments" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Owner Discord ID
            <input name="ownerId" placeholder="Optional" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Title
            <input name="title" placeholder="Optional" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
          </label>
          <label class="block text-sm text-zinc-200">
            Active
            <select name="isActive" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label class="block text-sm text-zinc-200 md:col-span-2">
            Description
            <textarea name="description" rows="2" class="mt-1 w-full rounded-md border-misfits-gray bg-zinc-900 text-zinc-100"></textarea>
          </label>
          <button type="submit" class="md:col-span-2 rounded-md bg-misfits-red1 px-4 py-2 font-semibold text-white transition hover:bg-misfits-red2">
            Save Showcase Item
          </button>
        </form>

        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-700 text-left text-zinc-300">
                <th class="px-2 py-2">Image</th>
                <th class="px-2 py-2">Category</th>
                <th class="px-2 py-2">Owner</th>
                <th class="px-2 py-2">Status</th>
                <th class="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if data.showcaseItems.length === 0}
                <tr><td colspan="5" class="px-2 py-4 text-zinc-400">No showcase metadata found.</td></tr>
              {/if}
              {#each data.showcaseItems as item}
                <tr class="border-b border-zinc-800/70 text-zinc-200 align-top">
                  <td class="px-2 py-2 font-mono text-xs break-all max-w-[26rem]">{item.imageUrl}</td>
                  <td class="px-2 py-2">{item.category}</td>
                  <td class="px-2 py-2 font-mono text-xs">{item.ownerId ?? '-'}</td>
                  <td class="px-2 py-2">{item.isActive ? 'Active' : 'Inactive'}</td>
                  <td class="px-2 py-2">
                    <div class="flex flex-wrap gap-2">
                      <form method="POST" action="?/upsertShowcaseItem">
                        <input type="hidden" name="imageUrl" value={item.imageUrl} />
                        <input type="hidden" name="category" value={item.category} />
                        <input type="hidden" name="title" value={item.title ?? ''} />
                        <input type="hidden" name="description" value={item.description ?? ''} />
                        <input type="hidden" name="ownerId" value={item.ownerId ?? ''} />
                        <input type="hidden" name="isActive" value={item.isActive ? 'false' : 'true'} />
                        <button type="submit" class="rounded border border-zinc-500/60 bg-zinc-800/40 px-2 py-1 text-xs font-semibold text-zinc-100 hover:bg-zinc-700/50">
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
                      <form method="POST" action="?/deleteShowcaseItem">
                        <input type="hidden" name="imageUrl" value={item.imageUrl} />
                        <button type="submit" class="rounded border border-rose-500/60 bg-rose-900/30 px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-900/40">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-misfits-gray bg-misfits-charcoal/85 p-5 shadow-panel">
        <h2 class="text-lg font-bold text-zinc-100">Departments Posts Management</h2>
        <div class="mt-3 space-y-3">
          {#if data.allOpenings.length === 0}
            <p class="text-zinc-400">No posts found.</p>
          {/if}
          {#each data.allOpenings as opening}
            <div class="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="font-semibold text-zinc-100">{opening.title}</p>
                <p class="text-xs text-zinc-400">ID: <span class="font-mono">{opening.id}</span></p>
              </div>
              <p class="mt-1 text-xs text-zinc-400">
                Owner: <span class="font-mono">{opening.authorId}</span> ({opening.authorName}) | Status: {opening.closedAt ? 'Closed' : 'Open'}
              </p>

              <form method="POST" action="?/updateDepartmentPost" class="mt-3 grid gap-2 md:grid-cols-2">
                <input type="hidden" name="openingId" value={opening.id} />
                <input name="title" value={opening.title} class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
                <input name="contact" value={opening.contact} class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
                <select name="category" class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">
                  <option value="Business" selected={opening.category === 'Business'}>Business</option>
                  <option value="Gang" selected={opening.category === 'Gang'}>Gang</option>
                  <option value="Department" selected={opening.category === 'Department'}>Department</option>
                </select>
                <input name="tags" value={formatTags(opening.tags)} class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
                <textarea name="description" rows="3" class="md:col-span-2 rounded-md border-misfits-gray bg-zinc-900 text-zinc-100">{opening.description}</textarea>
                <button type="submit" class="rounded-md bg-misfits-red1 px-3 py-2 text-sm font-semibold text-white transition hover:bg-misfits-red2">
                  Update Post
                </button>
              </form>

              <form method="POST" action="?/transferDepartmentOwnership" class="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input type="hidden" name="openingId" value={opening.id} />
                <input name="newOwnerId" placeholder="New Owner Discord ID" class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
                <input name="newOwnerName" placeholder="New Owner Username" class="rounded-md border-misfits-gray bg-zinc-900 text-zinc-100" />
                <button type="submit" class="rounded-md border border-zinc-500/60 bg-zinc-800/40 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-700/50">
                  Transfer Owner
                </button>
              </form>

              <form method="POST" action="?/deleteDepartmentPost" class="mt-2">
                <input type="hidden" name="openingId" value={opening.id} />
                <button type="submit" class="rounded border border-rose-500/60 bg-rose-900/30 px-3 py-1.5 text-sm font-semibold text-rose-200 hover:bg-rose-900/40">
                  Delete Post
                </button>
              </form>
            </div>
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
