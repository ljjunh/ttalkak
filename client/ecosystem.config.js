module.exports = {
  apps: [
    {
      name: "ttalkak", // 앱 이름
      cwd: "./", // 현재 디렉토리
      script: "npm", // 실행할 명령어
      args: "start",
      instances: "max", // 실행할 인스턴스 수(max = cpu 코어 수만큼)
      exec_mode: "cluster", // 여러 프로세스를 생성해서 로드밸런싱함
      autorestart: true, // 앱이 크래시되면 자동으로 재시작
      watch: false, // 파일 변경을 감지하여 자동으로 재시작할지 여부
      max_memory_restart: "2G", // 메모리 사용량 맥스
      listen_timeout: 50000, // 앱 시작 -> 리스닝 될때까지 기다리는 시간 이시간까지 안되면 재시작
      kill_timeout: 5000, // 프로세스 강제종료 전에 기다리는 시간
    },
  ],
};
