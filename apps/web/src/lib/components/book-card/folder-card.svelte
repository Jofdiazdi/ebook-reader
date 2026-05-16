<script lang="ts">
  import { onDestroy } from 'svelte';

  export let name: string;
  export let coverStack: (string | Blob)[] = [];

  let objectUrls: string[] = [];
  let coverUrls: string[] = [];
  let loadErrors = new Set<number>();

  function updateUrls(stack: (string | Blob)[]) {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
    loadErrors = new Set();

    coverUrls = stack.map((cover) => {
      if (typeof cover === 'string') {
        return cover;
      }

      const blob = cover.type ? cover : new Blob([cover], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      return url;
    });
  }

  $: updateUrls(coverStack);

  onDestroy(() => {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  });
</script>

<div tabindex="0" role="button" class="flex flex-col" on:click on:keyup draggable="false">
  <div class="aspect-w-2 aspect-h-3 relative rounded-lg">
    {#if coverUrls.length}
      <div class="absolute inset-0">
        {#each coverUrls.slice(0, 3) as url, i}
          {#if !loadErrors.has(i)}
            <div
              class="absolute flex items-center justify-center overflow-hidden bg-transparent"
              style="
                width: 82%;
                height: 92%;
                top: 50%;
                left: 50%;
                z-index: {coverUrls.length - i};
                transform: translate(-50%, -50%) translateX(-{i * 20}px) translateY(-{i *
                20}px) scale({1 - i * 0.05});
              "
            >
              <img
                src={url}
                alt=""
                class="max-h-full max-w-full object-contain border-2 border-black rounded"
                draggable="false"
                on:error={() => {
                  loadErrors = new Set([...loadErrors, i]);
                }}
              />
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-700 bg-opacity-20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-16 w-16 text-yellow-500"
          fill="currentColor"
        >
          <path
            d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
          />
        </svg>
      </div>
    {/if}
  </div>
  <div class="-mt-10 p-1">
    <span class="line-clamp-2 text-center text-xs text-black">{name}</span>
  </div>
</div>
