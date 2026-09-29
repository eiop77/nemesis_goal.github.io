"use strict";


/* =========================================================
   네메시스 커스텀 목표 데이터
   ========================================================= */

const OBJECTIVES = [

    {
        id: "survive",
        title: "생존",
        text:
            "게임 종료 시점에 생존해 있어야 한다."
    },

    {
        id: "escape",
        title: "탈출",
        text:
            "게임 종료 시 탈출선에 탑승하여 네메시스를 탈출해야 한다."
    },

    {
        id: "research",
        title: "연구 데이터",
        text:
            "연구실에서 연구 데이터를 확보하고 네메시스를 탈출해야 한다."
    },

    {
        id: "sample",
        title: "표본 확보",
        text:
            "게임 종료 전에 네메시스에서 지정된 표본을 확보해야 한다."
    },

    {
        id: "destroy",
        title: "파괴",
        text:
            "네메시스가 지구에 도착하기 전에 지정된 목표를 파괴해야 한다."
    },

    {
        id: "infected",
        title: "감염",
        text:
            "게임 종료 시 감염된 상태로 생존해 있어야 한다."
    },

    {
        id: "coordinates",
        title: "좌표 확보",
        text:
            "게임 종료 전에 지정된 좌표 정보를 확보해야 한다."
    },

    {
        id: "crew",
        title: "승무원 생존",
        text:
            "지정된 승무원이 게임 종료 시 생존해 있어야 한다."
    }

];


/* =========================================================
   상태
   ========================================================= */

let assignedPlayers = [];

let currentPlayerIndex = 0;


/* =========================================================
   DOM
   ========================================================= */

const setupScreen =
    document.getElementById("setupScreen");

const qrScreen =
    document.getElementById("qrScreen");

const objectiveScreen =
    document.getElementById("objectiveScreen");

const scannerScreen =
    document.getElementById("scannerScreen");

const errorScreen =
    document.getElementById("errorScreen");

const playerCount =
    document.getElementById("playerCount");

const startButton =
    document.getElementById("startButton");

const nextPlayerButton =
    document.getElementById("nextPlayerButton");

const hideObjectiveButton =
    document.getElementById("hideObjectiveButton");

const errorBackButton =
    document.getElementById("errorBackButton");


/* =========================================================
   화면 전환
   ========================================================= */

function showScreen(screen) {

    [
        setupScreen,
        qrScreen,
        objectiveScreen,
        scannerScreen,
        errorScreen
    ].forEach(
        element => element.classList.add("hidden")
    );

    screen.classList.remove("hidden");
}


/* =========================================================
   배열 섞기
   Fisher-Yates Shuffle
   ========================================================= */

function shuffle(array) {

    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];
    }

    return result;
}


/* =========================================================
   목표 생성
   ========================================================= */

function createObjectives(playerCount) {

    /*
     * 목표를 랜덤하게 섞는다.
     */

    const shuffled =
        shuffle(OBJECTIVES);


    /*
     * 현재 예제에서는
     * 플레이어 수만큼 목표를 뽑는다.
     */

    assignedPlayers = [];

    for (
        let i = 0;
        i < playerCount;
        i++
    ) {

        assignedPlayers.push({

            player:
                i + 1,

            objective:
                shuffled[i]

        });
    }
}


/* =========================================================
   QR에 넣을 데이터
   ========================================================= */

function createQRData(player) {

    /*
     * QR 코드에 넣을 데이터
     *
     * 목표 원문을 직접 넣는 대신
     * Base64 형태로 변환한다.
     *
     * 나중에 여기 부분을 AES 암호화로
     * 변경할 수 있다.
     */

    const payload = {

        type:
            "NEMESIS_OBJECTIVE",

        version:
            1,

        player:
            player.player,

        objective:
            player.objective

    };


    const json =
        JSON.stringify(payload);


    const encoded =
        base64Encode(json);


    /*
     * URL fragment를 이용한다.
     *
     * 예:
     *
     * https://example.github.io/
     * #NMS1.eyJ0eXBlIjoi...
     */

    const url =
        window.location.origin +
        window.location.pathname +
        "#NMS1." +
        encoded;


    return url;
}


/* =========================================================
   UTF-8 Base64
   ========================================================= */

function base64Encode(text) {

    const bytes =
        new TextEncoder().encode(text);

    let binary = "";

    bytes.forEach(
        byte => {
            binary +=
                String.fromCharCode(byte);
        }
    );

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


function base64Decode(encoded) {

    encoded =
        encoded
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    while (
        encoded.length % 4
    ) {

        encoded += "=";
    }

    const binary =
        atob(encoded);

    const bytes =
        Uint8Array.from(
            binary,
            character =>
                character.charCodeAt(0)
        );

    return new TextDecoder()
        .decode(bytes);
}


/* =========================================================
   QR 표시
   ========================================================= */

function showQRCode() {

    showScreen(qrScreen);


    /*
     * 플레이어 번호
     */

    const playerNumber =
        currentPlayerIndex + 1;

    document.getElementById(
        "currentPlayer"
    ).textContent =
        playerNumber;

    document.getElementById(
        "qrPlayerNumber"
    ).textContent =
        playerNumber;


    /*
     * 진행률
     */

    document.getElementById(
        "progressText"
    ).textContent =
        `${playerNumber} / ${assignedPlayers.length}`;


    /*
     * QR 초기화
     */

    const qrContainer =
        document.getElementById("qrcode");

    qrContainer.innerHTML = "";


    /*
     * QR 데이터 생성
     */

    const qrData =
        createQRData(
            assignedPlayers[currentPlayerIndex]
        );


    /*
     * QR 생성
     */

    new QRCode(
        qrContainer,
        {

            text:
                qrData,

            width:
                240,

            height:
                240,

            correctLevel:
                QRCode.CorrectLevel.H

        }
    );


    /*
     * 마지막 플레이어
     */

    if (
        currentPlayerIndex ===
        assignedPlayers.length - 1
    ) {

        nextPlayerButton.textContent =
            "✓ 게임 준비 완료";

    } else {

        nextPlayerButton.textContent =
            "다음 플레이어 →";

    }
}


/* =========================================================
   시작
   ========================================================= */

startButton.addEventListener(
    "click",
    () => {

        const count =
            Number(
                playerCount.value
            );


        createObjectives(count);


        currentPlayerIndex = 0;


        showQRCode();

    }
);


/* =========================================================
   다음 플레이어
   ========================================================= */

nextPlayerButton.addEventListener(
    "click",
    () => {

        if (
            currentPlayerIndex <
            assignedPlayers.length - 1
        ) {

            currentPlayerIndex++;

            showQRCode();

            return;
        }


        /*
         * 마지막 플레이어까지 완료
         */

        alert(
            "모든 플레이어에게 목표가 전달되었습니다."
        );

    }
);


/* =========================================================
   목표 표시
   ========================================================= */

function showObjective(data) {

    document.getElementById(
        "objectivePlayer"
    ).textContent =
        `PLAYER ${data.player}`;


    document.getElementById(
        "objectiveTitle"
    ).textContent =
        data.objective.title;


    document.getElementById(
        "objectiveText"
    ).textContent =
        data.objective.text;


    showScreen(
        objectiveScreen
    );
}


/* =========================================================
   QR 데이터 처리
   ========================================================= */

function processQRData(url) {

    try {

        /*
         * QR에 들어있는 URL에서
         * # 뒤의 데이터를 가져온다.
         */

        const hash =
            new URL(url)
                .hash;


        if (
            !hash.startsWith("#NMS1.")
        ) {

            throw new Error(
                "네메시스 QR 코드가 아닙니다."
            );
        }


        const encoded =
            hash.substring(
                "#NMS1.".length
            );


        const json =
            base64Decode(encoded);


        const data =
            JSON.parse(json);


        /*
         * 데이터 검증
         */

        if (
            data.type !==
            "NEMESIS_OBJECTIVE"
        ) {

            throw new Error(
                "잘못된 목표 데이터입니다."
            );
        }


        showObjective(data);

    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "errorMessage"
        ).textContent =
            error.message;

        showScreen(
            errorScreen
        );
    }
}


/* =========================================================
   URL Fragment 자동 처리
   ========================================================= */

function checkURLHash() {

    const hash =
        window.location.hash;


    if (
        !hash.startsWith("#NMS1.")
    ) {

        return;
    }


    const fakeUrl =
        window.location.href;


    processQRData(fakeUrl);
}


/* =========================================================
   목표 숨기기
   ========================================================= */

hideObjectiveButton.addEventListener(
    "click",
    () => {

        /*
         * 목표를 다시 보이지 않게 한다.
         *
         * QR을 다시 찍으면 다시 볼 수 있다.
         */

        showScreen(
            scannerScreen
        );

        startScanner();

    }
);


/* =========================================================
   QR Scanner
   ========================================================= */

let scanner = null;


function startScanner() {

    /*
     * 이미 실행 중이면 종료
     */

    if (scanner) {

        try {
            scanner.clear();
        }
        catch (error) {
            console.log(error);
        }

    }


    scanner =
        new Html5Qrcode("reader");


    scanner.start(

        {
            facingMode:
                "environment"
        },

        {
            fps:
                10,

            qrbox:
                {
                    width: 250,
                    height: 250
                }

        },

        decodedText => {

            scanner.stop()
                .catch(
                    () => {}
                );


            processQRData(
                decodedText
            );

        },

        errorMessage => {

            /*
             * QR 탐색 중 발생하는
             * 일반적인 오류이므로
             * 화면에 표시하지 않는다.
             */

        }

    )
    .catch(error => {

        console.error(error);

        alert(
            "카메라를 사용할 수 없습니다.\n" +
            "브라우저의 카메라 권한을 확인해주세요."
        );

    });
}


/* =========================================================
   에러 화면
   ========================================================= */

errorBackButton.addEventListener(
    "click",
    () => {

        showScreen(
            setupScreen
        );

    }
);


/* =========================================================
   페이지 최초 실행
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * QR을 찍어서 들어온 경우
         * 자동으로 목표를 표시한다.
         */

        checkURLHash();

    }
);
