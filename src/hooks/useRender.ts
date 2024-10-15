import _ from "lodash";
import { nextTick, reactive, toRefs, unref } from "vue";
import { layer } from "@layui/layui-vue";

import {
  jsplumbSetting,
  jsplumbSourceOptions,
  jsplumbTargetOptions,
  jsplumbConnectOptions,
} from "../utils/defaultSetting";
import { getUUID } from "../utils/index";

interface node {
  id: string;
  name: string;
  type: string;
  left: string;
  top: string;
  ico: string;
  state: string;
  viewOnly?: boolean;
}

interface line {
  from: string;
  to: string;
  label?: string;
  connector?: string;
  anchors?: any;
  paintStyle?: any;
}

interface activeNode {
  type: string; //  node 、line
  nodeId: string; // 节点id
  sourceId: string; // 连线开始的节点id
  targetId: string; // 连线结束的节点id
}
interface flowSetting {
  zoom: number; // 画布缩放比例
}

interface schemaData {
  nodeList: node[];
  lineList: line[];
  [propName: string]: any;
}

interface State {
  refContainer: any;
  refNodeForm: any;
  jsPlumb: any;
  ready: boolean;
  loadFinish: boolean;
  data: schemaData;
  activeNode: activeNode;
  setting: flowSetting;
}

export const useRender = (id: string = "container") => {
  const state = reactive<State>({
    refContainer: null,
    refNodeForm: null,
    jsPlumb: null,
    ready: true,
    loadFinish: false,
    data: {
      nodeList: [],
      lineList: [],
    },
    activeNode: {
      type: "",
      nodeId: "",
      sourceId: "",
      targetId: "",
    },
    setting: {
      zoom: 0.5,
    },
  });
  const cloneJsplumbSetting = _.cloneDeep(jsplumbSetting);
  cloneJsplumbSetting.Container = id;

  const { refContainer, ready, jsPlumb, data, activeNode, refNodeForm } =
    toRefs(state);

  const renderNode = () => {
    // 渲染节点
    for (var i = 0; i < state.data.nodeList.length; i++) {
      let node = state.data.nodeList[i];
      // 设置源点，可以拖出线连接其他节点
      state.jsPlumb.makeSource(node.id, _.merge(jsplumbSourceOptions, {}));
      // // 设置目标点，其他源点拖出的线可以连接该节点
      state.jsPlumb.makeTarget(node.id, jsplumbTargetOptions);
      if (!node.viewOnly) {
        state.jsPlumb.draggable(node.id, {
          containment: "parent",
          stop: function (el: any) {
            // 拖拽节点结束后的对调
            console.log("拖拽结束: ", el);
          },
        });
      }
    }
    // 渲染连接线
    for (var i = 0; i < state.data.lineList.length; i++) {
      let line = state.data.lineList[i];
      var connParam = {
        source: line.from,
        target: line.to,
        label: line.label ? line.label : "",
        connector: line.connector ? line.connector : "",
        anchors: line.anchors ? line.anchors : undefined,
        paintStyle: line.paintStyle ? line.paintStyle : undefined,
      };
      state.jsPlumb.connect(connParam, jsplumbConnectOptions);
    }
    state.loadFinish = true;
  };
  const jsPlumbRender = () => {
    state.jsPlumb.ready(() => {
      // 导入默认配置
      state.jsPlumb.importDefaults(cloneJsplumbSetting);
      // 会使整个jsPlumb立即重绘。
      state.jsPlumb.setSuspendDrawing(false, true);
      // 初始化节点
      renderNode();
      // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
      state.jsPlumb.bind(
        "click",
        (
          conn: { sourceId: any; targetId: any; getLabel: () => any },
          originalEvent: any
        ) => {
          state.activeNode.type = "line";
          state.activeNode.sourceId = conn.sourceId;
          state.activeNode.targetId = conn.targetId;
          unref(refNodeForm).lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel(),
          });
        }
      );
      // 连线
      state.jsPlumb.bind(
        "connection",
        (evt: { source: { id: any }; target: { id: any } }) => {
          console.log("进行连线connection");
          let from = evt.source.id;
          let to = evt.target.id;
          if (state.loadFinish) {
            state.data.lineList.push({ from: from, to: to });
          }
        }
      );

      // 删除连线回调
      state.jsPlumb.bind(
        "connectionDetached",
        (evt: { sourceId: any; targetId: any }) => {
          deleteLine(evt.sourceId, evt.targetId);
        }
      );

      // 改变线的连接节点
      state.jsPlumb.bind(
        "connectionMoved",
        (evt: { originalSourceId: any; originalTargetId: any }) => {
          console.log("connectionMoved", evt);
        }
      );

      // 连线右击
      state.jsPlumb.bind("contextmenu", (evt: any) => {
        console.log("contextmenu", evt);
      });

      // 连线
      state.jsPlumb.bind(
        "beforeDrop",
        (evt: { sourceId: any; targetId: any }) => {
          let from = evt.sourceId;
          let to = evt.targetId;
          if (from === to) {
            layer.msg("节点不支持连接自己", { icon: 2 });
            return false;
          }
          if (hasLine(from, to)) {
            layer.msg("该关系已存在,不允许重复创建", { icon: 2 });
            return false;
          }
          if (hashOppositeLine(from, to)) {
            layer.msg("不支持两个节点之间连线回环", { icon: 2 });
            return false;
          }
          layer.msg("连接成功", { icon: 1 });
          return true;
        }
      );

      // beforeDetach
      state.jsPlumb.bind("beforeDetach", (evt: any) => {
        console.log("beforeDetach", evt);
      });
      state.jsPlumb.setContainer(state.refContainer);
    });
  };
  const loadData = (data: schemaData) => {
    ready.value = false;
    state.data = Object.assign({ nodeList: [], lineList: [] }, data);
    nextTick(() => {
      ready.value = true;
      render();
    });
  };
  const render = () => {
    state.jsPlumb = (window as any).jsPlumb.getInstance();
    nextTick(() => {
      jsPlumbRender();
    });
  };

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

  /**
   * 点击节点
   * @param nodeId
   */
  function clickNode(nodeId: string) {
    state.activeNode.type = "node";
    state.activeNode.nodeId = nodeId;
    state.refNodeForm.nodeInit(state.data, nodeId);
  }
  /**
   * 改变节点
   * @param data
   */
  function changeNode(data: any) {
    const { id, ...info } = data;
    state.data.nodeList.forEach((item: any) => {
      if (item.id === id) {
        Object.assign(item, info);
      }
    });
  }

  /**
   * 改变连线
   * @param data
   */
  function changeLine(data: any) {
    const { from, to, label } = data;
    const conn = state.jsPlumb.getConnections({
      source: from,
      target: to,
    })[0];
    conn.setLabel({
      label,
    });
    if (!label || label === "") {
      conn.removeClass("flowLabel");
      conn.addClass("emptyFlowLabel");
    } else {
      conn.addClass("flowLabel");
    }
    state.data.lineList.forEach(function (line: {
      from: any;
      to: any;
      label: any;
    }) {
      if (line.from == from && line.to == to) {
        line.label = label;
      }
    });
  }

  // 删除线
  function deleteLine(from: any, to: any) {
    state.data.lineList = state.data.lineList.filter(function (line: {
      from: any;
      to: any;
    }) {
      if (line.from == from && line.to == to) {
        return false;
      }
      return true;
    });
  }

  // 删除激活的元素
  function deleteElement() {
    if (state.activeNode.type === "node") {
      deleteNode(state.activeNode.nodeId);
    } else if (state.activeNode.type === "line") {
      layer.confirm("确定删除所点击的线吗?", {
        title: "提示",
        btn: [
          {
            text: "确定",
            callback: (id: any) => {
              var conn = state.jsPlumb.getConnections({
                source: state.activeNode.sourceId,
                target: state.activeNode.targetId,
              })[0];
              state.jsPlumb.deleteConnection(conn);
              layer.close(id);
            },
          },
          {
            text: "取消",
            callback: (id: any) => {
              layer.close(id);
            },
          },
        ],
      });
    }
  }

  /**
   * 删除节点
   * @param nodeId 被删除节点的ID
   */
  function deleteNode(nodeId: string) {
    layer.confirm("确定要删除节点" + nodeId + "?", {
      title: "提示",
      btn: [
        {
          text: "确定",
          callback: (id: any) => {
            /**
             * 这里需要进行业务判断，是否可以删除
             */
            state.data.nodeList = state.data.nodeList.filter(function (node: {
              id: string;
            }) {
              if (node.id === nodeId) {
                return false;
              }
              return true;
            });
            nextTick(() => {
              state.jsPlumb.removeAllEndpoints(nodeId);
            });
            layer.close(id);
          },
        },
        {
          text: "取消",
          callback: (id: any) => {
            layer.close(id);
          },
        },
      ],
    });
  }

  function hasLine(from: any, to: any) {
    for (var i = 0; i < state.data.lineList.length; i++) {
      var line = state.data.lineList[i];
      if (line.from === from && line.to === to) {
        return true;
      }
    }
    return false;
  }

  // 是否含有相反的线
  function hashOppositeLine(from: any, to: any) {
    return hasLine(to, from);
  }

  return {
    refContainer,
    refNodeForm,
    ready,
    jsPlumb,
    data,
    activeNode,
    loadData,
    render,
    addNode,
    clickNode,
    changeNode,
    changeLine,
    deleteElement,
  };
};
