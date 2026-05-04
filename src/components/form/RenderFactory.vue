<script lang="ts">
import { defineComponent, type PropType, type VNodeChild } from 'vue'

export default defineComponent({
  name: 'RenderFactory',
  props: {
    render: {
      type: Function as PropType<() => VNodeChild>,
      required: true,
    },
  },
  render() {
    return this.render()
  },
})
</script>
