
      function readURL(input) {
        return new Promise((resolve) => {
            if (input.files && input.files[0]) {
              var reader = new FileReader();
              reader.onload = function (e) {
                document.getElementById("loading").style.display = "block";
                document.getElementById("imagePreview").style.backgroundImage = "url(" + e.target.result + ")";
                document.getElementById("imagePreview").style.display = "none";
                document.getElementById("imagePreview").style.display = "block";

                var faceImage = document.getElementById("face-image");
                faceImage.onload = function() {
                    resolve();
                };
                faceImage.setAttribute("src", e.target.result);
              };
              reader.readAsDataURL(input.files[0]);
            } else {
                resolve();
            }
        });
      }

      document.getElementById("imageUpload").addEventListener("change", function () {
        readURL(this).then(() => {
            predict().then(() => {
              document.getElementById("loading").style.display = "none";
            });
        });
      });

      // Call init immediately so the model is loaded when the script runs
      init();

      // More API functions here:
      // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

      // the link to your model provided by Teachable Machine export panel
      const URL = "https://teachablemachine.withgoogle.com/models/zvuQeLXs1/";

      let model, webcam, labelContainer, maxPredictions;

      // Load the image model and setup the webcam
      async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
          // and class labels
          labelContainer.appendChild(document.createElement("div"));
        }
      }

      const classData = {
        "Class1": { title: "1인분 타입", explain: "&nbsp;모든게 평균 이상으로 작업, 주특기 모두 1인분 이상 해내는 타입.<br> 선임에게도 예의를 적절히 갖추고 후임도 지킬것만 지키면 터치하지 않으며 두루두루 잘 지냄.<br> 같이 근무서면 재미는 없는데 사회에 나가서 무슨 일 할지 같이 걱정하면서 시간 보냄.", titleColor: "#48d27d", boxColor: "#9adbb3", barColor: "#3ba363" },
        "Class2": { title: "특수보직 타입", explain: "&nbsp;군종병, 1호차 운전병 등 묘하게 꿀빠는 것 처럼 보이는데 알고보면 빡센 일 하고있는 타입.<br> 자기 할 일 하느라 생활관에서 잘 안보이는데 가끔 나타나서 말 걸면 스트레스 심하게 받은 상태라 띠겁고 예민함.<br> 한명 잡아서 장난치기 시작하면 끝도 없어서 가까이 안 가는게 상책.", titleColor: "#d51c00", boxColor: "#fce5e1", barColor: "#a71f0a" },
        "Class3": { title: "불만가득 에이스 타입", explain: "&nbsp;작업 개잘하고 주특기도 에이스급인데 화가 가득차있음. 뭘 해도 투덜거리고 얼굴에 불만이 가득함.<br> 근데 또 일은 잘해서 간부들이나 선임들이 칭찬 많이함.<br> 훈련때 안보이면 행보관이 데려가서 어디서 나무자르고 있거나 제초작업 하고있을 가능성이 높음.<br> 근무 서면 근무시간 내내 FM으로 털리거나 아무말도 안함", titleColor: "#d35500", boxColor: "#e1b598", barColor: "#a44303" },
        "Class4": { title: "부산 풀코스 타입", explain: "&nbsp;뭔진 모르겠는데 자기가 부산의 통이었고 부산만 오면 풀코스로 모시겠다고 함. 부산에선 짱을 통이라고 함.<br> 막상 부산 가면 뻘쭘하게 만나서 돼지국밥 한그릇 하고 바다 한번 보고 술먹으러 가까예..? 하면 병아리같은 치킨만 파는 호프집가서 맥주 마시는게 다임.<br> 연락이 안되는 경우도 파다함.", titleColor: "#004dac", boxColor: "#86a7cf", barColor: "#003980" },
        "Class5": { title: "개웃긴 또라이 타입", explain: "&nbsp;같이 있으면 미친듯이 웃김. 갓 전입왔는데 생활관에 이사람 있으면 점호때 웃음참느라 고생함.<br> 일이나 훈련은 잘 못해도 혼은 잘 안남.<br> 가끔 진지충 선임한테 털리기도 하는데 본인은 별로 신경 안씀.<br> 대신 사고칠까봐 간부들이 무서워함. 탄약고에서 담배피기 등등.", titleColor: "#b0003e", boxColor: "#cc9dae", barColor: "#690226" },
        "Class6": { title: "군대 늦게 들어온 타입", explain: "&nbsp;얼굴만 보면 행보관인데 늦게 군대 온 관상임.<br> 조직생활하다가 들어온 경우가 있어서 좀 조심해야함.<br> 의외로 조용히 군생활 하고 가려고 해서 선임 깍듯하게 대하고 후임은 잘 챙겨줌.<br> 근데 선임들이 부담스러워함.", titleColor: "#a94c00", boxColor: "#bf9877", barColor: "#502400" },
        "Class7": { title: "개폐급 관심병사 타입", explain: "&nbsp;전투모부터 이상하게 쓰고있음. 훈련이든 작업이든 근무든 하고있는거 보고있으면 개답답해서 한숨만 나옴.<br> 선임들이 답답해서 털고싶어도 툭 건드리면 전투화끈 풀어서 화장실로 갈 것 같은 자살페이스하고 있어서 포기함.<br> CCTV병 같은 이상한 보직 받거나 행보관 또는 중대장이 항상 데리고 다님.<br> 그러다가 그린캠프 가거나 중대 내 투명인간됨.", titleColor: "#00769b", boxColor: "#a9d2de", barColor: "#00222c" },
        "Class8": { title: "탈영각 보이는 개또라이 선임 타입", explain: "&nbsp;자대갔는데 이런 얼굴 보이면 탈영해야함. 사람을 이런 방식으로도 털 수 있구나 하는 생각이 들 정도로 멘탈 탈수기임.<br> 말투부터 범상치 않은 경우가 많음.<br> 후임을 너무 잘 갈궈서 선임들이 좋아하기도 함.<br> 다른 후임 털고있는거 보면 웃길때도 있어서 조심해야함. 웃는 순간 나한테도 화살이 돌아옴.<br> 같이 근무설때 재밌는 이야기 준비 안해가면 개털릴 준비 해야함. 사회에서 만나면 자기는 애들 갈궜던거 기억도 못하고 애들이 다 자기 좋아했다고 함.", titleColor: "#2e0060", boxColor: "#9061c2", barColor: "#2e0060" },
        "Class9": { title: "알고보면 천사타입", explain: "&nbsp;얼굴만 보면 무서운데 알고보면 착한 선임.<br> 가까이 가면 분유 냄새 같은거 남.<br> 대신 하는 것 마다 어설퍼서 선임들한테는 털리고 다님.<br> 그래도 자기가 후임들 혼내지는 않음.<br> 같이 근무 들어가면 조용히 졸고있을 확률이 높음.<br> 대신 가끔 탄입대에 간식 숨겨와서 부사수랑 같이 먹음.<br> 짬통 국물 원샷할시 전역가능? 이라는 질문에 진지하게 고민함.", titleColor: "#709200", boxColor: "#d2dfa5", barColor: "#415500" },
        "Class10": { title: "투페이스 타입", explain: "&nbsp;분명 이등병때부터 상병 초중반까진 천사에 작업도 잘하는 에이스 선임이었는데, 병장 달고나서 군생활에 현타 씨게 느낀 이후부터 악마로 바뀌는 얼굴임.<br> 분대장 교육대 가서 1등하고 돌아와서 포상휴가 같은것도 많이 나감.<br> 신기할 정도로 못하는게 없는데 병장때부터 아무것도 안하려고 하고 누워서 잠만자는 짬병장이 되거나 악마로 변해서 좀 친해진 일병 괴롭히는 재미로 지냄.", titleColor: "#0b8500", boxColor: "#69b462", barColor: "#053e00" },
        "Class11": { title: "에이스 분대장 타입", explain: "&nbsp;모든것을 S급으로 해내는 타입.<br> 군생활 처음부터 끝까지 흐트러짐이 없어서 간부들이 좋아하고 행보관이 심심하면 전문하사 해보라고 권유함.<br> 개인정비 시간에 안보이면 체력단련장 가서 운동하고 있음", titleColor: "#448e7e", boxColor: "#54b19d", barColor: "#1a3630" },
        "Class12": { title: "귀여움 받아서 조심해야하는 타입", explain: "&nbsp;소대장이랑 선임들이 귀여워함.<br> 개또라이 선임이 잘때 끌어안고 자려고 해서 조심해야함.<br> 샤워할땐 더 조심해야함.", titleColor: "#335384", boxColor: "#fbcced", barColor: "#c10288" },
        "Class13": { title: "진지충 FM 타입", explain: "&nbsp;같이 근무서면 두시간 내내 개진지한 이야기만 하거나 진짜 가만히 근무만 서는 FM 선임.<br> 전투복이고 모포고 관물대고 모든것에 각이 잡혀있음.<br>점호 끝나면 제일 먼저 행정반 가서 연등신청해서 사회 나가서 할 공부 미리 하고있음.<br> 후임 터치 잘 안하는데 위험한 훈련때는 윽박 많이 지름.", titleColor: "#9c9c00", boxColor: "#e7e7af", barColor: "#646400" },
      };

      // run the webcam image through the image model
      async function predict() {
        // predict can take in an image, video or canvas html element
        var image = document.getElementById("face-image");

        const prediction = await model.predict(image, false);

        prediction.sort(
          (a, b) => parseFloat(b.probability) - parseFloat(a.probability)
        );

        var topClass = prediction[0].className;
        var data = classData[topClass];
        var resultMessage = data ? data.title : "알수없음";
        var resultExplain = data ? data.explain : "다른 사진으로 재시도해주세요!";
        var titleColor = data ? data.titleColor : "#000";
        var title = "<div class='army-title' style='color: " + titleColor + ";'>" + resultMessage + "</div>";
        var explain = "<div class='army-explain pt-2'>" + resultExplain + "</div>";
        document.querySelector(".result-message").innerHTML = title + explain;
        var barWidth;
        for (let i = 0; i < maxPredictions; i++) {
          if (prediction[i].probability.toFixed(2) > 0.1) {
            barWidth =
              Math.round(prediction[i].probability.toFixed(2) * 100) + "%";
          } else if (prediction[i].probability.toFixed(2) >= 0.01) {
            barWidth = "4%";
          } else {
            barWidth = "2%";
          }
          var cName = prediction[i].className;
          var cData = classData[cName];
          var labelTitle = cData ? cData.title : "알수없음";
          var boxColor = cData ? cData.boxColor : "#ccc";
          var barColor = cData ? cData.barColor : "#777";

          var label = "<div class='army-label d-flex align-items-center'>" + labelTitle + "</div>";
          var bar = "<div class='bar-container position-relative container'>" +
                    "<div class='type-box' style='background-color: " + boxColor + ";'></div>" +
                    "<div class='d-flex justify-content-center align-items-center type-bar' style='width: " + barWidth + "; background-color: " + barColor + ";'>" +
                    "<span class='d-block percent-text'>" + Math.round(prediction[i].probability.toFixed(2) * 100) + "%</span>" +
                    "</div></div>";
          labelContainer.childNodes[i].innerHTML = label + bar;
        }
      }
