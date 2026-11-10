<script lang="ts">
  interface Props {
    text: string;
    label?: string;
  }
  let { text, label = 'Note' }: Props = $props();
  let open = $state(false);
  const id = `tip-${Math.random().toString(36).slice(2, 9)}`;
</script>

<span class="tipwrap">
  <button
    type="button"
    class="tipbtn"
    aria-label={label}
    aria-expanded={open}
    aria-describedby={open ? id : undefined}
    onclick={() => (open = !open)}
    onblur={() => (open = false)}
  >i</button>
  {#if open}
    <span class="tip panel" role="tooltip" {id}>{text}</span>
  {/if}
</span>

<style>
  .tipwrap {
    position: relative;
    display: inline-block;
    vertical-align: middle;
  }
  .tipbtn {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--amber);
    background: rgba(255, 179, 71, 0.12);
    color: var(--amber);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
  }
  .tip {
    position: absolute;
    z-index: 30;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    width: min(320px, 80vw);
    padding: 10px 12px;
    font-family: var(--font-body);
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--text);
    text-transform: none;
    letter-spacing: 0;
    background: var(--panel-strong);
    border-color: rgba(255, 179, 71, 0.5);
  }
</style>
