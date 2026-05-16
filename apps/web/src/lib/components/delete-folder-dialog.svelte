<script lang="ts">
  import DialogTemplate from '$lib/components/dialog-template.svelte';
  import Ripple from '$lib/components/ripple.svelte';
  import { buttonClasses } from '$lib/css-classes';
  import { createEventDispatcher } from 'svelte';

  export let folderName: string;
  export let resolver: (arg0: 'delete' | 'move_up' | null) => void;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  function closeDialog(value: 'delete' | 'move_up' | null) {
    resolver(value);
    dispatch('close');
  }
</script>

<DialogTemplate>
  <svelte:fragment slot="header">Delete Folder</svelte:fragment>
  <svelte:fragment slot="content">
    <p>What should happen to the contents of "{folderName}"?</p>
  </svelte:fragment>
  <div class="flex grow justify-between" slot="footer">
    <button class={buttonClasses} on:click={() => closeDialog(null)}>
      Cancel
      <Ripple />
    </button>
    <button class={buttonClasses} on:click={() => closeDialog('move_up')}>
      Move contents up
      <Ripple />
    </button>
    <button class={buttonClasses} on:click={() => closeDialog('delete')}>
      Delete contents
      <Ripple />
    </button>
  </div>
</DialogTemplate>
