export const useMockData = () => {
  const dataA = {
    name: "流程A",
    nodeList: [
      {
        id: "nodeA",
        name: "流程A-节点A",
        type: "task",
        left: "26px",
        top: "161px",
        ico: "layui-icon-heart",
        state: "error",
      },
      {
        id: "nodeB",
        name: "流程A-节点B",
        type: "task",
        left: "340px",
        top: "161px",
        ico: "layui-icon-light",
      },
      {
        id: "nodeC",
        name: "流程A-节点C",
        type: "task",
        left: "739px",
        top: "161px",
        ico: "layui-icon-time",
      },
    ],
    lineList: [
      {
        from: "nodeA",
        to: "nodeB",
      },
      {
        from: "nodeB",
        to: "nodeC",
      },
    ],
  };

  const dataB = {
    name: "流程B",
    nodeList: [
      {
        id: "nodeA",
        name: "节点A-不可拖拽",
        type: "task",
        left: "18px",
        top: "223px",
        ico: "el-icon-user-solid",
        state: "success",
        viewOnly: true,
      },
      {
        id: "nodeB",
        type: "task",
        name: "流程B-节点B",
        left: "351px",
        top: "96px",
        ico: "el-icon-goods",
        state: "error",
      },
      {
        id: "nodeC",
        name: "流程B-节点C",
        type: "task",
        left: "354px",
        top: "351px",
        ico: "el-icon-present",
        state: "warning",
      },
      {
        id: "nodeD",
        name: "流程B-节点D",
        type: "task",
        left: "723px",
        top: "215px",
        ico: "el-icon-present",
        state: "running",
      },
    ],
    lineList: [
      {
        from: "nodeA",
        to: "nodeB",
        label: "条件A",
      },
      {
        from: "nodeA",
        to: "nodeC",
        label: "条件B",
      },
      {
        from: "nodeB",
        to: "nodeD",
      },
      {
        from: "nodeC",
        to: "nodeD",
      },
    ],
  };

  return {
    dataA,
    dataB,
  };
};
