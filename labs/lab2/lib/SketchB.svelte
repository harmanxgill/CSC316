<script>
  let { data } = $props();
</script>

<section aria-labelledby="heading-B">
  <h2 id="heading-B">Sketch B</h2>
  <p>{data.length} terminals</p>
  <p class="placeholder">Your code sketch will appear here after the paper-sketch activity.</p>
</section>

<style>
  section { padding: 1.5rem; min-height: 240px; background: white; border: 1px solid #bbb; border-radius: 6px; }
  h2 { margin-top: 0; }
  .placeholder { color: #666; margin-top: 3rem; }
</style>
