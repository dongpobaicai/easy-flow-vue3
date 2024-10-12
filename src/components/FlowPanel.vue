<template>
  <div class="flow-panel" v-if="ready">
    <div class="header">工具栏</div>
    <div class="flow-panel__layout">
      <div class="left-sider">左侧节点树</div>
      <div id="container" class="content" ref="refContainer" v-flow-drag>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position: absolute; top: 2000px; left: 2000px">&nbsp;</div>
      </div>
      <div class="right-sider">属性面板</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRender } from "../hooks/useRender";

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
const { refContainer, ready } = useRender();
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
    border-bottom: 1px solid #dadce0;
  }
  &__layout {
    display: flex;
    height: calc(100% - 47px);
    .left-sider {
      width: 230px;
      border-right: 1px solid #dce3e8;
    }
    .content {
      position: relative;
      overflow: scroll;
      flex: 1;
    }
    .right-sider {
      width: 300px;
      border-left: 1px solid #dce3e8;
      background-color: #fbfbfb;
    }
  }
}
</style>
