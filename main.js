const { ApiPromise, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const {WsProvider} = require("@polkadot/rpc-provider");
const wallet = require("./wallet.json");
async function batchCall(api, sender, calls) {
  const batch = api.tx.utility.batchAll(calls);

  // 发送批量调用交易并等待确认
  const hash = await batch.signAndSend(sender);
  console.log(`Batch call hash: ${hash}`);
}

const sleep = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  })
}

// 示例用法
async function main() {
  try {
    // 设置连接到的Polkadot节点的RPC地址
    const provider = new WsProvider('wss://rpc.polkadot.io');

    // 初始化 API
    const api = await ApiPromise.create({provider});

    // 等待密码学库准备好
    await cryptoWaitReady();

    // 创建发送者账户
    const keyring = new Keyring({ type: 'sr25519' });
    const sender = keyring.addFromMnemonic(wallet.mnemonic);

    // 定义要批量调用的交易
    const calls = [
      // Balances.transferKeepAlive
      api.tx.balances.transferKeepAlive(wallet.address, 0), // 转账 1 DOT
      // api.tx.balances.transferKeepAlive('recipient_address_2_here', 2000000000000), // 转账 2 DOT

      // System.remark
      api.tx.system.remark('{"p":"dot-20","op":"mint","tick":"DOTA"}'),
      // 添加其他调用...
    ];

    // 执行批量调用
    await batchCall(api, sender, calls);
    await sleep();
    await main();
  }catch(e) {
    console.log(e.message);
    await sleep();
    await main();
  }
  
}

// 运行示例
// while(true) {
(async() => {
  try {
    main()
  }catch(e) {
    await sleep();
    main();
  }  
})();


// }

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception:', err.message);
  // 在此处进行处理，例如记录日志、计数重启次数等
  // 如果达到重启次数上限，可以调用 process.exit()
  main();
});


