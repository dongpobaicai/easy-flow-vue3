<template>
  <div class="node-config">
    <div class="node-form-header">属性配置</div>
    <div class="node-form-body">
      <template v-if="node.id || line.from">
        <template v-if="type === 'node'">
          <lay-form :model="node" label-width="80px">
            <lay-form-item label="类型">
              <lay-input v-model="node.type" disabled></lay-input>
            </lay-form-item>
            <lay-form-item label="名称">
              <lay-input v-model="node.name" placeholder="请输入"></lay-input>
            </lay-form-item>
            <lay-form-item label="left坐标">
              <lay-input v-model="node.left" disabled></lay-input>
            </lay-form-item>
            <lay-form-item label="top坐标">
              <lay-input v-model="node.top" disabled></lay-input>
            </lay-form-item>
            <lay-form-item label="ico图标">
              <lay-input v-model="node.ico" placeholder="请输入layui框架自带的ico"></lay-input>
            </lay-form-item>
            <lay-form-item label="状态">
              <lay-select
                :options="stateOptions"
                v-model="node.state"
                placeholder="请选择"
                style="width: 100%"
              ></lay-select>
            </lay-form-item>
            <lay-form-item label=" ">
              <lay-button type="primary" prefix-icon="layui-icon-ok" size="sm" @click="saveConfig">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </template>
        <template v-else-if="type === 'line'">
          <lay-form :model="line" label-width="80px">
            <lay-form-item label="条件">
              <lay-input v-model="line.label" placeholder="请输入"></lay-input>
            </lay-form-item>
            <lay-form-item label=" ">
              <lay-button type="primary" prefix-icon="layui-icon-ok" size="sm" @click="saveConfig">保存</lay-button>
            </lay-form-item>
          </lay-form>
        </template>
      </template>
      <lay-empty v-else description="请点击节点查看"></lay-empty>
    </div>
  </div>
</template>
<script setup>
import { reactive, toRefs } from "vue";
import { cloneDeep } from "lodash";
import { stateOptions } from "../utils/defaultSetting";

const emits = defineEmits(["success"]);
const state = reactive({
  type: "node",
  node: {},
  line: {},
  data: {},
});
const { type, node, line } = toRefs(state);
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

function lineInit(line) {
  state.type = "line";
  state.line = line;
}

function saveConfig() {
  if (state.type === "node") {
    state.data.nodeList.forEach((node) => {
      if (node.id === state.node.id) {
        node.name = state.node.name;
        node.left = state.node.left;
        node.top = state.node.top;
        node.ico = state.node.ico;
        node.state = state.node.state;
      }
    });
    emits("success", state.type);
  } else if (state.type === "line") {
    emits("success", state.type, { ...state.line });
  }
}

defineExpose({
  nodeInit,
  lineInit,
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
