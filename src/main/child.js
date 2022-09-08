const { exec, spawn, execSync } = require("child_process");
// const { mainWindow } = require("./main");

function child() {
  let passwd = process.argv[2];
  let nodename = process.argv[3];

  exec(
    `echo ${passwd}| sudo -S -k true &>/dev/null && echo true || echo false`,
    (err, stdout, stderr) => {
      console.log(`error1: ${err}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      if (stdout.includes("false")) {
        const invalid = { status: "INVALID" };
        process.send(JSON.stringify(invalid));
      }

      if (stdout.includes("true")) {
        //run selendra script
        // let random = (Math.random() + 1).toString(36).substring(7);
        // console.log("random" + random);
        // const SELENDRA_DB_NAME = "selendradb";
        // const CONTAINER_NAME = "sel-container" + random;
        // const container = { status: "CONTAINER", container: CONTAINER_NAME };
        // process.send(JSON.stringify(container));

        //check if container alr exist
        // const child = exec(
        //   `[ "$(docker ps -a | grep ${CONTAINER_NAME})" ] && docker container rm -f ${CONTAINER_NAME} && echo ${passwd} | sudo -S rm -r /home/koompi/${SELENDRA_DB_NAME}`,
        //   (err, stdout, stderr) => {
        //     console.log(`error: ${err}`);
        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        //   }
        // );
        const NODE_NAME = nodename;

        const start = `echo ${passwd} | sudo -S ./nodemgr add --name=${NODE_NAME} --path=/ --chain=testnet && echo ${passwd} | sudo -S ./nodemgr start`;
        exec(start, (err, stdout, stderr) => {
          console.log(`error-mgr: ${err}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stdout: ${stdout.length}`);
          console.log(`stderr: ${stderr}`);

          if (stdout.length >= 49) {
            try {
              const message1 = { status: "UPDATE" };
              process.send(JSON.stringify(message1));
              console.log(message1);
              const init = `echo ${passwd} | sudo -S ./nodemgr init`;
              execSync(init, { stdio: "inherit" });

              const message2 = { status: "RUNNING" };
              process.send(JSON.stringify(message2));
              console.log(message2);

              const add = `echo ${passwd} | sudo -S ./nodemgr add --name=${NODE_NAME} --path=/ --chain=testnet && echo ${passwd} | sudo -S ./nodemgr start`;
              execSync(add, { stdio: "inherit" });
            } catch (error) {
              console.log(
                `Status Code: ${error.status} with '${error.message}'`
              );
            }
          }
        });
        // try {
        //   const message1 = { status: "UPDATE" };
        //   process.send(JSON.stringify(message1));
        //   const run_osupdate_pull_docker = `echo ${passwd} | sudo -S pacman -S docker noto-fonts-emoji --noconfirm && echo ${passwd} | sudo -S systemctl enable --now docker && echo ${passwd} | sudo -S docker image pull selendrachain/selendra:latest && mkdir -p ~/${SELENDRA_DB_NAME} && echo ${passwd} | sudo chown 1000.1000 ~/${SELENDRA_DB_NAME} -R`;
        //   execSync(run_osupdate_pull_docker, { stdio: "inherit" });

        //   const message2 = { status: "RUNNING" };
        //   process.send(JSON.stringify(message2));

        //   const run_docker_container = `sleep 5s; echo ${passwd} | sudo -S docker container run --network="host" --name ${CONTAINER_NAME} -v /home/$USER/${SELENDRA_DB_NAME}:/selendra/data selendrachain/selendra:latest --base-path selendra/data --chain testnet --port 30333 --rpc-port 9934 --ws-port 9944 --validator --name ${NODE_NAME} --bootnodes /ip4/157.245.56.213/tcp/30333/p2p/12D3KooWDLR899Spcx4xJ3U8cZttv9zjzJoey3HKaTZiNqwojZJB`;
        //   execSync(run_docker_container, { stdio: "inherit" });
        // } catch (error) {
        //   console.log(`Status Code: ${error.status} with '${error.message}'`);
        // }
        //running testnet

        //running mainnet
        // try {
        //   const message2 = { status: "RUNNING" };
        //   process.send(JSON.stringify(message2));
        //   const run_docker_container = `echo ${passwd} | sudo -S docker container run --network="host" --name ${CONTAINER_NAME} -v /home/$USER/${SELENDRA_DB_NAME}:/selendra/data selendrachain/selendra:latest --base-path selendra/data --port 30333 --rpc-port 9934 --ws-port 9944 --validator --name ${NODE_NAME} --bootnodes /ip4/157.245.56.213/tcp/30333/p2p/12D3KooWDLR899Spcx4xJ3U8cZttv9zjzJoey3HKaTZiNqwojZJB`;
        //   execSync(run_docker_container, { stdio: "inherit" });
        // } catch (error) {
        //   console.log(`Status Code: ${error.status} with '${error.message}'`);
        // }
        // console.log(`Done ${passwd}`);
      }
    }
  );
}

child();
