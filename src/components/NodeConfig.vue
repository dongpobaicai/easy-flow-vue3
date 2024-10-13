<template>
  <div class="node-config">
    <div class="node-form-header">属性配置</div>
    <div class="node-form-body">
      <lay-form v-if="node.id" :model="node" label-width="80px">
        <lay-form-item label="类型">
          <lay-input v-model="node.type" disabled></lay-input>
        </lay-form-item>
        <lay-form-item label="名称">
          <lay-input v-model="node.name" placeholder="请输入"></lay-input>
        </lay-form-item>
      </lay-form>
      <lay-empty v-else description="请点击节点查看"></lay-empty>
    </div>
  </div>
</template>
<script setup>
import { reactive, toRefs } from "vue";
import { cloneDeep } from "lodash";

const state = reactive({
  type: "node",
  node: {},
  line: {},
  data: {},
});
const { type, node } = toRefs(state);
/**
 * 表单修改，这里可以根据传入的ID进行业务信息获取
 * @param data
 * @param id
 */
function nodeInit(data, id) {
  state.type = "node";
  state.data = data;
  data.nodeList.forEach((node) => {
    if (node.id === id) {
      state.node = cloneDeep(node);
    }
  });
}

defineExpose({
  nodeInit,
});
</script>
<style lang="less" scoped>
.node-config {
  .node-form-header {
    height: 32px;
    border-top: 1px solid #dce3e8;
    border-bottom: 1px solid #dce3e8;
    background: #f1f3f4;
    color: #000;
    line-height: 32px;
    padding-left: 12px;
    font-size: 14px;
  }
  .node-form-body {
    margin-top: 10px;
    padding-right: 10px;
    padding-bottom: 20px;
    :deep(.layui-empty) {
      margin-top: 100px;
      .layui-empty-image {
        .layui-empty-image-default {
          height: 80px;
        }
      }
    }
  }
}
</style>
