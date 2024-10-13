import _ from "lodash";
import { nextTick, reactive, toRefs } from "vue";
import { jsPlumb as JSPlumb } from "jsplumb";

import {
  jsplumbSetting,
  jsplumbSourceOptions,
  jsplumbTargetOptions,
  jsplumbConnectOptions,
} from "../utils/defaultSetting";

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

  const { refContainer, ready, jsPlumb, data, activeNode, refNodeForm } = toRefs(state);

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
      // state.jsPlumb.bind("click", (conn: { sourceId: any; targetId: any; getLabel: () => any; }, originalEvent: any) => {
      //   this.activeElement.type = "line";
      //   this.activeElement.sourceId = conn.sourceId;
      //   this.activeElement.targetId = conn.targetId;
      //   this.$refs.nodeForm.lineInit({
      //     from: conn.sourceId,
      //     to: conn.targetId,
      //     label: conn.getLabel(),
      //   });
      // });
      // // 连线
      // this.jsPlumb.bind("connection", (evt) => {
      //   let from = evt.source.id;
      //   let to = evt.target.id;
      //   if (this.loadEasyFlowFinish) {
      //     this.data.lineList.push({ from: from, to: to });
      //   }
      // });

      // // 删除连线回调
      // this.jsPlumb.bind("connectionDetached", (evt) => {
      //   this.deleteLine(evt.sourceId, evt.targetId);
      // });

      // // 改变线的连接节点
      // this.jsPlumb.bind("connectionMoved", (evt) => {
      //   this.changeLine(evt.originalSourceId, evt.originalTargetId);
      // });

      // // 连线右击
      // this.jsPlumb.bind("contextmenu", (evt) => {
      //   console.log("contextmenu", evt);
      // });

      // // 连线
      // this.jsPlumb.bind("beforeDrop", (evt) => {
      //   let from = evt.sourceId;
      //   let to = evt.targetId;
      //   if (from === to) {
      //     this.$message.error("节点不支持连接自己");
      //     return false;
      //   }
      //   if (this.hasLine(from, to)) {
      //     this.$message.error("该关系已存在,不允许重复创建");
      //     return false;
      //   }
      //   if (this.hashOppositeLine(from, to)) {
      //     this.$message.error("不支持两个节点之间连线回环");
      //     return false;
      //   }
      //   this.$message.success("连接成功");
      //   return true;
      // });

      // // beforeDetach
      // this.jsPlumb.bind("beforeDetach", (evt) => {
      //   console.log("beforeDetach", evt);
      // });
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
    state.jsPlumb = JSPlumb.getInstance();
    nextTick(() => {
      jsPlumbRender();
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

  return {
    refContainer,
    refNodeForm,
    ready,
    jsPlumb,
    data,
    activeNode,
    loadData,
    render,
    clickNode,
  };
};
