<script lang="ts">
  import DialogTemplate from '$lib/components/dialog-template.svelte';
  import Ripple from '$lib/components/ripple.svelte';
  import { buttonClasses } from '$lib/css-classes';
  import type { BooksDbFolder } from '$lib/data/database/books-db/versions/books-db';
  import { database } from '$lib/data/store';
  import { createEventDispatcher } from 'svelte';

  export let resolver: (arg0: number | null) => void;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let allFolders: BooksDbFolder[] = [];
  let selectedFolderId: number | null = null;

  async function loadFolders() {
    const db = await database.db;
    allFolders = await db.getAll('folder');
  }

  loadFolders();

  function closeDialog(value: number | null) {
    resolver(value);
    dispatch('close');
  }
</script>

<DialogTemplate>
  <svelte:fragment slot="header">Move to Folder</svelte:fragment>
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-2">
      <button
        class={buttonClasses}
        class:bg-blue-500={selectedFolderId === null}
        class:text-white={selectedFolderId === null}
        on:click={() => (selectedFolderId = null)}
      >
        Root folder
        <Ripple />
      </button>
      {#each allFolders as folder}
        <button
          class={buttonClasses}
          class:bg-blue-500={selectedFolderId === folder.id}
          class:text-white={selectedFolderId === folder.id}
          on:click={() => (selectedFolderId = folder.id)}
        >
          {folder.name}
          <Ripple />
        </button>
      {/each}
    </div>
  </svelte:fragment>
  <div class="flex grow justify-between" slot="footer">
    <button class={buttonClasses} on:click={() => closeDialog(null)}>
      Cancel
      <Ripple />
    </button>
    <button
      class={buttonClasses}
      on:click={() => {
        if (selectedFolderId !== undefined) closeDialog(selectedFolderId ?? null);
      }}
    >
      Move
      <Ripple />
    </button>
  </div>
</DialogTemplate>
