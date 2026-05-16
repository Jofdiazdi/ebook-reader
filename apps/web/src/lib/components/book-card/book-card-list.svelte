<script lang="ts">
  import { faCheckCircle, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
  import BookCard from '$lib/components/book-card/book-card.svelte';
  import type { BookCardProps } from '$lib/components/book-card/book-card-props';
  import type { FolderCardProps } from '$lib/components/book-card/folder-card-props';
  import FolderCard from '$lib/components/book-card/folder-card.svelte';
  import Popover from '$lib/components/popover/popover.svelte';
  import { dummyFn } from '$lib/functions/utils';
  import { createEventDispatcher } from 'svelte';
  import Fa from 'svelte-fa';

  export let bookCards: BookCardProps[] = [];
  export let folders: FolderCardProps[] = [];
  export let currentBookId: number | undefined;
  export let selectedBookIds: ReadonlySet<number>;
  export let selectedFolderIds: ReadonlySet<number>;

  const dispatch = createEventDispatcher<{
    bookClick: {
      id: number;
    };
    removeBookClick: {
      id: number;
    };
    folderClick: {
      id: number;
    };
    removeFolderClick: {
      id: number;
    };
    moveItem: {
      itemId: number;
      itemType: 'book' | 'folder';
      targetFolderId: number;
    };
    createFolderWithItems: {
      ids: number[];
    };
  }>();

  let hoveringBookId: number | undefined;
  let hoveringFolderId: number | undefined;
  let dragOverFolderId: number | undefined;
  let isDragging = false;
  let dragOverCreateFolder = false;

  function onBookCardClick(id: number) {
    dispatch('bookClick', { id });
  }

  function onFolderCardClick(id: number) {
    dispatch('folderClick', { id });
  }

  function getCardDateInfo(dateTime: number) {
    return dateTime ? new Date(dateTime).toLocaleString() : 'No Data';
  }

  function handleDragStart(event: DragEvent, itemId: number, itemType: 'book' | 'folder') {
    const ids =
      itemType === 'book' && selectedBookIds.has(itemId) ? Array.from(selectedBookIds) : [itemId];
    event.dataTransfer?.setData(
      'application/json',
      JSON.stringify({
        itemId,
        itemType,
        selectedIds: itemType === 'book' ? ids : undefined
      })
    );
    event.dataTransfer!.effectAllowed = 'move';
    isDragging = true;
  }

  function handleDragEnd() {
    isDragging = false;
    dragOverFolderId = undefined;
    dragOverCreateFolder = false;
  }

  function handleDragOver(event: DragEvent, folderId: number) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    dragOverFolderId = folderId;
  }

  function handleDragLeave(_event: DragEvent, _folderId: number) {
    dragOverFolderId = undefined;
  }

  function handleDrop(event: DragEvent, folderId: number) {
    event.preventDefault();
    dragOverFolderId = undefined;
    isDragging = false;
    const rawData = event.dataTransfer?.getData('application/json');
    if (!rawData) return;
    try {
      const { itemId, itemType } = JSON.parse(rawData) as {
        itemId: number;
        itemType: 'book' | 'folder';
      };
      if (itemType === 'folder' && itemId === folderId) return;
      dispatch('moveItem', { itemId, itemType, targetFolderId: folderId });
    } catch {}
  }

  function handleCreateFolderDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    dragOverCreateFolder = true;
  }

  function handleCreateFolderDragLeave(_event: DragEvent) {
    dragOverCreateFolder = false;
  }

  function handleCreateFolderDrop(event: DragEvent) {
    event.preventDefault();
    dragOverCreateFolder = false;
    isDragging = false;
    const rawData = event.dataTransfer?.getData('application/json');
    if (!rawData) return;
    try {
      const { itemType, selectedIds } = JSON.parse(rawData) as {
        itemType: 'book' | 'folder';
        selectedIds?: number[];
      };
      if (itemType !== 'book') return;
      const ids = selectedIds || [];
      if (!ids.length) return;
      dispatch('createFolderWithItems', { ids });
    } catch {}
  }
</script>

<div class="grid grid-cols-3 justify-between gap-5 pb-4 md:grid-cols-4 lg:grid-cols-5">
  {#if isDragging}
    <div
      role="banner"
      class="relative"
      on:dragover={handleCreateFolderDragOver}
      on:dragleave={handleCreateFolderDragLeave}
      on:drop={handleCreateFolderDrop}
    >
      <div
        class="aspect-w-2 aspect-h-3 relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed mdc-elevation-transition"
        class:border-blue-400={dragOverCreateFolder}
        class:bg-blue-400={dragOverCreateFolder}
        class:bg-opacity-20={dragOverCreateFolder}
        class:border-gray-500={!dragOverCreateFolder}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="mb-2 h-12 w-12 fill-current"
          class:text-blue-400={dragOverCreateFolder}
          class:text-gray-500={!dragOverCreateFolder}
        >
          <path
            d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10zM13 9h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"
          />
        </svg>
        <span
          class="text-center text-xs font-medium px-2"
          class:text-blue-400={dragOverCreateFolder}
          class:text-gray-500={!dragOverCreateFolder}
        >
          Drop to create folder
        </span>
      </div>
    </div>
  {/if}

  {#each folders as folder (folder.id)}
    <div
      role="banner"
      class="relative"
      on:mouseenter={() => (hoveringFolderId = folder.id)}
      on:mouseleave={() => {
        hoveringFolderId = undefined;
      }}
      on:dragover={(ev) => handleDragOver(ev, folder.id)}
      on:dragleave={(ev) => handleDragLeave(ev, folder.id)}
      on:drop={(ev) => handleDrop(ev, folder.id)}
    >
      <div
        class="relative"
        class:ring-2={dragOverFolderId === folder.id}
        class:ring-blue-400={dragOverFolderId === folder.id}
      >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          draggable="true"
          on:dragstart={(ev) => handleDragStart(ev, folder.id, 'folder')}
          on:dragend={handleDragEnd}
          on:click={() => onFolderCardClick(folder.id)}
          on:keyup={dummyFn}
        >
          <FolderCard name={folder.name} coverStack={folder.coverStack} />
        </div>

        {#if selectedFolderIds.has(folder.id)}
          <div
            tabindex="0"
            role="button"
            title="Folder selected"
            class="absolute inset-0 bg-gray-700 bg-opacity-20"
            on:click={() => onFolderCardClick(folder.id)}
            on:keyup={dummyFn}
          >
            <Fa class="absolute left-2 top-2 flex text-xl text-white" icon={faCheckCircle} />
          </div>
        {/if}
      </div>
      {#if folder.id === hoveringFolderId}
        <div
          tabindex="0"
          role="button"
          class="mdc-elevation--z2 hover:mdc-elevation--z8 mdc-elevation-transition absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-400"
          on:click={() => dispatch('removeFolderClick', { id: folder.id })}
          on:keyup={dummyFn}
        >
          <svg role="img" class="w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 504 504">
            <path
              class="fill-current text-white"
              d="M369.6 313.1c4.7 4.7 4.7 12.3 0 17L330 369.6c-4.7 4.7-12.3 4.7-17 0L248 304l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L126.4 330c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L304 248l65.6 65.1z"
            />
          </svg>
        </div>
      {/if}
    </div>
  {/each}

  {#each bookCards as bookCard (bookCard.id)}
    <div
      role="banner"
      class="relative"
      class:opacity-60={bookCard.isPlaceholder}
      on:mouseenter={() => (hoveringBookId = bookCard.id)}
      on:mouseleave={() => (hoveringBookId = undefined)}
    >
      <div
        class="mdc-elevation--z1 hover:mdc-elevation--z8 mdc-elevation-transition relative overflow-hidden"
        class:rounded-tl-xl={bookCard.id === currentBookId}
        class:mdc-elevation--z4={selectedBookIds.has(bookCard.id) || bookCard.id === currentBookId}
      >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          draggable="true"
          on:dragstart={(ev) => handleDragStart(ev, bookCard.id, 'book')}
          on:dragend={handleDragEnd}
        >
          <BookCard {...bookCard} on:click={() => onBookCardClick(bookCard.id)} />
        </div>

        {#if selectedBookIds.has(bookCard.id)}
          <div
            tabindex="0"
            role="button"
            title="Book selected"
            class="absolute inset-0 bg-gray-700 bg-opacity-20"
            on:click={() => onBookCardClick(bookCard.id)}
            on:keyup={dummyFn}
          >
            <Fa class="absolute left-2 top-2 flex text-xl text-white" icon={faCheckCircle} />
          </div>
        {/if}
      </div>
      {#if selectedBookIds.has(bookCard.id)}
        <div class="absolute top-10 left-2" title="Click to open details">
          <Popover placement="right" fallbackPlacements={['bottom']} yOffset={5}>
            <Fa
              slot="icon"
              class="mdc-elevation--z2 hover:mdc-elevation--z8 mdc-elevation-transition left-2 top-10 rounded-full bg-blue-400 text-xl text-white"
              icon={faCircleInfo}
            />
            <div class="p-4" slot="content">
              <div>Characters:</div>
              <div class="w-40">{bookCard.characters || 'No Data'}</div>
              <div class="mt-4">Last Read:</div>
              <div class="w-40">{getCardDateInfo(bookCard.lastBookOpen)}</div>
              <div class="mt-4">Bookmarked:</div>
              <div class="w-40">{getCardDateInfo(bookCard.lastBookmarkModified)}</div>
              <div class="mt-4">Last Update:</div>
              <div class="w-40">{getCardDateInfo(bookCard.lastBookModified)}</div>
            </div>
          </Popover>
        </div>
      {/if}
      {#if bookCard.id === hoveringBookId}
        <div
          tabindex="0"
          role="button"
          class="mdc-elevation--z2 hover:mdc-elevation--z8 mdc-elevation-transition absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-400"
          on:click={() => dispatch('removeBookClick', { id: bookCard.id })}
          on:keyup={dummyFn}
        >
          <svg role="img" class="w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 504 504">
            <path
              class="fill-current text-white"
              d="M369.6 313.1c4.7 4.7 4.7 12.3 0 17L330 369.6c-4.7 4.7-12.3 4.7-17 0L248 304l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L126.4 330c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L304 248l65.6 65.1z"
            />
          </svg>
        </div>
      {/if}
    </div>
  {/each}
</div>
