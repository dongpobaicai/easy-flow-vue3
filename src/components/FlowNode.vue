<template>
  <div ref="nodeRef" :style="nodeContainerStyle" :class="nodeContainerClass" @click="clickNode" @mouseup="changeNode">
    <!-- 最左侧的那条竖线 -->
    <div class="node-left"></div>
    <!-- 节点类型的图标 -->
    <lay-icon :type="node.ico" :class="nodeIcoClass"></lay-icon>
    <!-- 节点名称 -->
    <div class="node-text" :show-overflow-tooltip="true">
      {{ node.name }}
    </div>
    <!-- 节点状态图标 -->
    <div class="ef-node-right-ico">
      <lay-icon :type="rightIcon.type" :color="rightIcon.color" :class="nodeIcoClass"></lay-icon>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, unref } from "vue";

const props = defineProps({
  node: Object,
  activeElement: Object,
});
const emits = defineEmits(["clickNode", "changeNode"]);
const nodeRef = ref();

// 节点容器样式
const nodeContainerStyle = computed(() => {
  return {
    top: props.node.top,
    left: props.node.left,
  };
});

const nodeContainerClass = computed(() => {
  return {
    "node-container": true,
    "node-active": props.activeElement.type == "node" ? props.activeElement.nodeId === props.node.id : false,
  };
});

const nodeIcoClass = computed(() => {
  var nodeIcoClass = { "node-left-ico": true };
  // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
  nodeIcoClass["flow-node-drag"] = props.node.viewOnly ? false : true;
  return nodeIcoClass;
});

const rightIcon = computed(() => {
  let type = "",
    color = "";
  switch (props.node.state) {
    case "success":
      type = "layui-icon-success";
      color = "#84CF65";
      break;
    case "error":
      type = "layui-icon-error";
      color = "#F56C6C";
      break;
    case "warning":
      type = "layui-icon-about";
      color = "#E6A23C";
      break;
    case "running":
      type = "layui-icon-loading";
      color = "#84CF65";
      break;
  }
  return {
    type,
    color,
  };
});

// 点击节点
function clickNode() {
  emits("clickNode", props.node.id);
}

// 鼠标移动后抬起，触发修改节点位置事件
function changeNode() {
  if (props.node.left === unref(nodeRef).style.left && props.node.top === unref(nodeRef).style.top) {
    return true;
  }
  emits("changeNode", {
    id: props.node.id,
    left: unref(nodeRef).style.left,
    top: unref(nodeRef).style.top,
  });
}
</script>
<style lang="less" scoped>
.node-container {
  position: absolute;
  display: flex;
  width: 170px;
  height: 32px;
  border: 1px solid #e0e3e7;
  border-radius: 5px;
  background-color: #fff;
  &:hover {
    /* 设置移动样式*/
    cursor: move;
    background-color: #f0f7ff;
    background-color: #f0f7ff;
    border: 1px dashed var(--global-primary-color);
  }
  /*节点左侧的竖线*/
  .node-left {
    width: 4px;
    background-color: var(--global-primary-color);
    border-radius: 4px 0 0 4px;
  }

  /*节点左侧的图标*/
  .node-left-ico {
    line-height: 32px;
    margin-left: 8px;
  }

  .node-left-ico:hover {
    /* 设置拖拽的样式 */
    cursor: crosshair;
  }
  .node-text {
    color: #565758;
    font-size: 12px;
    line-height: 32px;
    margin-left: 8px;
    width: 100px;
    /* 设置超出宽度文本显示方式*/
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
  /*节点右侧的图标*/
  .node-right-ico {
    line-height: 32px;
    position: absolute;
    right: 5px;
    cursor: default;
  }
}

/*节点激活样式*/
.node-active {
  background-color: #f0f7ff;
  background-color: #f0f7ff;
  border: 1px solid var(--global-primary-color);
}
</style>
