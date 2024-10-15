<template>
  <lay-collapse class="left-menu" v-model="openKeys">
    <lay-collapse-item :id="menu.id" :title="menu.name" v-for="menu in menuList">
      <template #title="{ props }">
        <span style="font-weight: bold">{{ props.title }}</span>
      </template>
      <ul class="menu-ul">
        <draggable @end="end" @start="move" :list="menu.children" :options="draggableOptions">
          <template #item="{ element }">
            <li class="menu-li" :key="element.id" :type="element.type">
              <lay-icon :type="element.ico" size="14px"></lay-icon>
              {{ element.name }}
            </li>
          </template>
        </draggable>
      </ul>
    </lay-collapse-item>
  </lay-collapse>
</template>
<script setup>
import { ref } from "vue";
import { menuList } from "../utils/defaultSetting";
import draggable from "vuedraggable";

const emits = defineEmits(["addNode"]);
const openKeys = ["1", "2"];
// draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
const draggableOptions = {
  preventOnFilter: false,
  sort: false,
  disabled: false,
  ghostClass: "ghost",
  // 不使用H5原生的配置
  forceFallback: true,
};
const selectNode = ref();
const mousePosition = {
  left: -1,
  top: -1,
};

const getNodeyType = (type) => {
  for (let i = 0; i < menuList.length; i++) {
    let children = menuList[i].children;
    for (let j = 0; j < children.length; j++) {
      if (children[j].type === type) {
        return children[j];
      }
    }
  }
};
// 拖拽开始时触发
const move = (evt, a, b, c) => {
  const type = evt.item.attributes.type.nodeValue;
  console.log("type", type);
  selectNode.value = getNodeyType(type);
};
// 拖拽结束时触发
const end = (evt, e) => {
  emits("addNode", evt, selectNode.value, mousePosition);
};

// 是否是火狐浏览器
const isFirefox = () => {
  var userAgent = navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) {
    return true;
  }
  return false;
};

/**
 * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
 * @param event
 */
if (isFirefox()) {
  document.body.ondrop = function (event) {
    // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
    mousePosition.left = event.layerX;
    mousePosition.top = event.clientY - 50;
    event.preventDefault();
    event.stopPropagation();
  };
}
</script>
<style lang="less" scoped>
.left-menu {
  .menu-ul {
    list-style: none;
    .menu-li {
      color: #565758;
      width: 180px;
      border: 1px dashed #e0e3e7;
      margin: 5px 0 5px 0;
      padding: 5px;
      border-radius: 5px;
      padding-left: 8px;
      &:hover {
        cursor: move;
        background-color: #f0f7ff;
        border: 1px dashed var(--global-primary-color);
        border-left: 4px solid var(--global-primary-color);
        padding-left: 5px;
      }
    }
  }
}
</style>
