<template>
  <div class="flow-panel" v-if="ready">
    <div class="header">
      <span class="link">{{ data.name }}</span>
      <lay-line direction="vertical"></lay-line>
      <lay-icon
        type="layui-icon-delete"
        :class="{ disabled: !activeNode.type }"
        @click="deleteElement"
      ></lay-icon>
      <lay-line direction="vertical"></lay-line>
      <lay-icon
        type="layui-icon-download-circle"
        @click="downloadData"
      ></lay-icon>
      <lay-line direction="vertical"></lay-line>
      <lay-icon type="layui-icon-addition" @click="zoomAdd"></lay-icon>
      <lay-line direction="vertical"></lay-line>
      <lay-icon type="layui-icon-subtraction" @click="zoomSub"></lay-icon>
      <div style="float: right; margin-right: 5px">
        <lay-button
          border="green"
          size="xs"
          prefix-icon="layui-icon-form"
          @click="showData"
          >流程信息</lay-button
        >
      </div>
    </div>
    <div class="flow-panel__layout">
      <div class="left-sider">
        <LeftMenu @addNode="addNode" />
      </div>
      <div id="container" class="content" ref="refContainer" v-flow-drag>
        <template v-for="node in data.nodeList" :key="node.id">
          <FlowNode
            :id="node.id"
            :node="node"
            :activeElement="activeNode"
            @clickNode="clickNode"
            @changeNode="changeNode"
          >
          </FlowNode>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position: absolute; top: 2000px; left: 2000px">&nbsp;</div>
      </div>
      <div class="right-sider">
        <NodeConfig ref="refNodeForm" @success="configSuccess" />
      </div>
    </div>
  </div>
  <lay-layer
    v-model="state.visible"
    title="流程数据信息"
    :area="['70%', 'auto']"
  >
    <div style="padding: 20px">
      <lay-quote>以下流程信息可以被存储起来，方便下一次流程加载</lay-quote>
      <Codemirror
        v-model="state.flowJsonData"
        :options="options"
        :style="{ height: '400px' }"
      ></Codemirror>
    </div>
  </lay-layer>
</template>
<script setup lang="ts">
import { unref, reactive, nextTick } from "vue";
import { Codemirror } from "vue-codemirror";
import { useRender } from "../hooks/useRender";
import { useMockData } from "../hooks/useMockData";

import LeftMenu from "./LeftMenu.vue";
import FlowNode from "./FlowNode.vue";
import NodeConfig from "./NodeConfig.vue";

const state = reactive({
  visible: false,
  flowJsonData: "",
});
const vFlowDrag = {
  created: (el: any, binding: any) => {
    if (!binding) {
      return;
    }
    el.onmousedown = (e: any) => {
      if (e.button == 2) {
        // 右键不管
        return;
      }
      //  鼠标按下，计算当前原始距离可视区的高度
      let disX = e.clientX;
      let disY = e.clientY;
      el.style.cursor = "move";

      document.onmousemove = function (e) {
        // 移动时禁止默认事件
        e.preventDefault();
        const left = e.clientX - disX;
        disX = e.clientX;
        el.scrollLeft += -left;

        const top = e.clientY - disY;
        disY = e.clientY;
        el.scrollTop += -top;
      };

      document.onmouseup = function (e) {
        el.style.cursor = "auto";
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};
const options = {
  mode: { name: "javascript", json: true },
  lineNumbers: true,
};
const {
  refContainer,
  refNodeForm,
  ready,
  jsPlumb,
  data,
  activeNode,
  loadData,
  addNode,
  clickNode,
  changeNode,
  changeLine,
  deleteElement,
  downloadData,
  zoomAdd,
  zoomSub,
} = useRender();
const { dataA } = useMockData();

function configSuccess(type: string, data: any) {
  if (type === "node") {
    jsPlumb.value.repaint();
  } else {
    changeLine(data);
  }
}

function showData() {
  state.visible = true;
  nextTick(() => {
    state.flowJsonData = JSON.stringify(unref(data), null, 4).toString();
  });
}

loadData(dataA as any);
</script>
<style lang="less" scoped>
.flow-panel {
  height: 100vh;
  font-size: 14px;
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #e0e3e7;
    height: 20px;
  }
  .header {
    padding-left: 10px;
    box-sizing: border-box;
    height: 42px;
    line-height: 42px;
    z-index: 3;
    border-bottom: 1px solid #eee;
    .link {
      color: var(--global-primary-color);
    }
    .layui-icon {
      color: var(--global-primary-color);
      padding: 0px 4px;
      cursor: pointer;
      &.disabled {
        cursor: not-allowed;
        color: #c0c4cc;
      }
    }
  }
  &__layout {
    display: flex;
    height: calc(100% - 47px);
    .left-sider {
      width: 230px;
      border-right: 1px solid #eee;
    }
    .content {
      position: relative;
      overflow: scroll;
      flex: 1;
    }
    .right-sider {
      width: 300px;
      border-left: 1px solid #eee;
      background-color: #fbfbfb;
    }
  }
  :deep(.jtk-overlay) {
    cursor: pointer;
    color: #4a4a4a;
    font-size: 12px;
  }
  // 连线中的label 样式
  :deep(.jtk-overlay).flowLabel:not(.aLabel) {
    padding: 4px 10px;
    background-color: white;
    color: #565758 !important;
    border: 1px solid #e0e3e7;
    border-radius: 5px;
  }

  // label 为空的样式
  :deep(.emptyFlowLabel) {
  }
}
</style>
