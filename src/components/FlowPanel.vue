<template>
  <div class="flow-panel" v-if="ready">
    <div class="header">工具栏</div>
    <div class="flow-panel__layout">
      <div class="left-sider">
        <LeftMenu @addNode="addNode" />
      </div>
      <div id="container" class="content" ref="refContainer" v-flow-drag>
        <template v-for="node in data.nodeList" :key="node.id">
          <FlowNode :id="node.id" :node="node" :activeElement="activeNode" @clickNode="clickNode"> </FlowNode>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position: absolute; top: 2000px; left: 2000px">&nbsp;</div>
      </div>
      <div class="right-sider">
        <NodeConfig ref="refNodeForm" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick } from "vue";
import { layer } from "@layui/layui-vue";

import { useRender } from "../hooks/useRender";
import { useMockData } from "../hooks/useMockData";
import { getUUID } from "../utils/index";
import { jsplumbSourceOptions, jsplumbTargetOptions } from "../utils/defaultSetting";

import LeftMenu from "./LeftMenu.vue";
import FlowNode from "./FlowNode.vue";
import NodeConfig from "./NodeConfig.vue";

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
const { refContainer, refNodeForm, ready, jsPlumb, data, activeNode, loadData, clickNode } = useRender();
const { dataA } = useMockData();

/**
 * 拖拽结束后添加新的节点
 * @param evt
 * @param nodeMenu 被添加的节点对象
 * @param mousePosition 鼠标拖拽结束的坐标
 */
const addNode = (
  evt: { originalEvent: { clientX: any; clientY: any } },
  nodeMenu: { name: any; type: any; ico: any },
  mousePosition: any
) => {
  var screenX = evt.originalEvent.clientX,
    screenY = evt.originalEvent.clientY;
  var containerRect = refContainer.value.getBoundingClientRect();
  var left = screenX,
    top = screenY;
  // 计算是否拖入到容器中
  if (
    left < containerRect.x ||
    left > containerRect.width + containerRect.x ||
    top < containerRect.y ||
    containerRect.y > containerRect.y + containerRect.height
  ) {
    layer.msg("请把节点拖入到画布中", { icon: 2 });
    return;
  }
  left = left - containerRect.x + refContainer.value.scrollLeft;
  top = top - containerRect.y + refContainer.value.scrollTop;
  // 居中
  left -= 85;
  top -= 16;
  var nodeId = getUUID();
  // 动态生成名字
  var origName = nodeMenu.name;
  var nodeName = origName;
  var index = 1;
  while (index < 10000) {
    var repeat = false;
    for (var i = 0; i < data.value.nodeList.length; i++) {
      let node = data.value.nodeList[i];
      if (node.name === nodeName) {
        nodeName = origName + index;
        repeat = true;
      }
    }
    if (repeat) {
      index++;
      continue;
    }
    break;
  }
  const node = {
    id: nodeId,
    name: nodeName,
    type: nodeMenu.type,
    left: left + "px",
    top: top + "px",
    ico: nodeMenu.ico,
    state: "success",
  };
  /**
   * 这里可以进行业务判断、是否能够添加该节点
   */
  data.value.nodeList.push(node);
  console.log(data.value.nodeList);
  nextTick(() => {
    jsPlumb.value.makeSource(nodeId, jsplumbSourceOptions);
    jsPlumb.value.makeTarget(nodeId, jsplumbTargetOptions);
    jsPlumb.value.draggable(nodeId, {
      containment: "parent",
      stop: function (el: any) {
        // 拖拽节点结束后的对调
        console.log("拖拽结束: ", el);
      },
    });
  });
};

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
}
</style>
