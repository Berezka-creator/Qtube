
 $(document).ready(function(){

    var API_KEY="AIzaSyAEHX8Fv1RLEWVKWFzzk7QlB-2mb1RsvVo";

    var video= ''
  
    var playlistId = 'PLcHIy7MhWjmgA2YfyLc9kQpYOENBB9X_y';
    var URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
    var options = {
             part: 'snippet',
             key: API_KEY,
             maxResults: 20,
             playlistId: playlistId,
             playerVars: {rel:0}
         }

    loadVids();
    
         function loadVids(){
             $.getJSON(URL, options, function(data){
                 var id = data.items[0].snippet.resourceId.videoId; 
            
                 resultsLoop(data);

                 function resultsLoop(data) {

                             $.each(data.items, function(i, item){
                    
                                 var thumb = item.snippet.thumbnails.medium.url;
                                 var title=item.snippet.title;
                                 var desc = item.snippet.description.substring(0, 100);
                                 var vid=item.snippet.resourceId.videoId;

                                 $('main').append(`
                                 <article class="item" data-key="${vid}">
                                         <img src="${thumb}"
                                         alt=""  class="thumb" />
                                         <div class="details">
                                             <h4>${title}</h4>
                                             <p>${desc}</p>
                                         </div>
                                         </article>
                                 `);
                             })
         }

        });
    }

    //SEARCH VIDEOS
    $("#form").submit(function(event){
        event.preventDefault()
        var search=$("#search").val()

        videoSearch(API_KEY, search, 10)
    })

    function videoSearch(key, search, maxResults){
       // make sure to hide and pause the video if it was already playing

        if (player.getPlayerState()==1){
            player.pauseVideo();
        }
        $("#video").addClass('hide');

        $("#videos").empty()

        $.get("https://www.googleapis.com/youtube/v3/search?key="+ key
        + "&type=video&part=snippet&maxResults="+ maxResults
         + "&q="+ search, function(data){
            


            data.items.forEach(item => {

                var thumb = item.snippet.thumbnails.medium.url;
                var title=item.snippet.title;
                var desc = item.snippet.description.substring(0, 100);
                var vid=item.id.videoId;
            

                video =`
                <article class="item" data-key="${vid}">
                    <img src="${thumb}"
                     alt=""  class="thumb" />
                     <div class="details">
                         <h4>${title}</h4>
                         <p>${desc}</p>
                     </div>
                     </article>
                `
                $("#videos").append(video)
                
            })
        })
   
    }

    //save the video div in a variable for adding removing class from it
    let videoElement = document.getElementById('video');

    // load iFrame YouTube API and construct the video player

    // 1. Create a script tag with src= to youtube api and insert it before first script tag
    var tag = document.createElement("script");
    tag.id = "iframe-script";
    tag.src = "https://www.youtube.com/iframe_api";
    var iframeTag = document.getElementById("player");
    iframeTag.parentNode.insertBefore(tag, iframeTag.nextSibling);


      // 2. construct the player
      var player;
      window.onYouTubeIframeAPIReady = function () {
        console.log("youtube api read");
        player = new YT.Player('player', {

            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
        });
      }


      window.onPlayerReady = function (event) {

        console.log("player is ready");
      }

      window.onPlayerStateChange = function (event) {
        let e = event.data;
        console.log("video status is: " + e);

        if (e == 1){ // if player is playing then always show
            videoElement.classList.remove('hide');
        }
      }


    // load questions.json and shuffle
    var shuffledQuestions;
    $.getJSON ("questions.json", function (data){
        let questions = data;
        shuffledQuestions = questions.sort(() => Math.random() - .5);
        console.log("json loaded");
    });
    let currentQuestionIndex = 0;


    $('main').on('click', 'article', function (){

        // save the id of the video clicked in a variable
        let currentArticle = $(this);
        let videoId = currentArticle.attr('data-key');

        // Add event listener to video control buttons
        const prevVidBtn = document.getElementById('prev-video-btn');
        const closeVidBtn = document.getElementById('close-video-btn');
        const nextVidBtn = document.getElementById('next-video-btn');

        prevVidBtn.addEventListener('click', () => {
            // Make sure to stop the video if it is playing
            if (player.getPlayerState()==1 ){ // 1 means playing
                 player.pauseVideo();
            }
            currentArticle = currentArticle.prev('article');
            videoId = currentArticle.attr('data-key');

            startGame ();
        });
        nextVidBtn.addEventListener('click', () => {
                    // Make sure to stop the video if it is playing
                    if (player.getPlayerState()==1){ // 1 means playing
                         player.pauseVideo();
                    }
                    currentArticle = currentArticle.next('article');
                    videoId = currentArticle.attr('data-key');

                    startGame ();
        });
        closeVidBtn.addEventListener('click', () => {
                            // Make sure to stop the video if it is playing
                            if (player.getPlayerState()==1 ){ // 1 means playing
                                 player.pauseVideo();
                            }
                            videoElement.classList.add('hide');
        });





    
     
         //QUIZ CODE


        const quizBodyElement = document.getElementById('quiz-body')
        const cancelButton = document.getElementById('cancel-btn')
        const nextButton = document.getElementById('next-btn')
        const uvisibleContainer = document.getElementById('unvisible')
        uvisibleContainer.classList.add('unvisible')
        const questionContainerElement = document.getElementById('question-container')
        const questionElement = document.getElementById('question')
        const answerButtonsElement = document.getElementById('answer-buttons')

        cancelButton.addEventListener('click', () => {
            // incase user cancels after answering wrong reset and change index
            answerButtonsElement.classList.remove('disable')
            clearStatusClass(quizBodyElement)

            // hide quiz and show video if it was paused
            quizBodyElement.classList.add('hide');

        })


        nextButton.addEventListener('click', () => {
            answerButtonsElement.classList.remove('disable')
          
            clearStatusClass(quizBodyElement)

            showQuestion(shuffledQuestions[currentQuestionIndex]);
        })

    startGame()

    function startGame(){

        answerButtonsElement.classList.remove('hide')
        answerButtonsElement.classList.remove('disable')
        resetState()
        clearStatusClass(quizBodyElement)

        console.log("Start Game at index =" + currentQuestionIndex)

        quizBodyElement.classList.remove('hide')
        questionContainerElement.classList.remove('hide')

          // Make sure to pause the video if it is playing
          if (player.getPlayerState()==1){ // 1 means playing
            player.pauseVideo();

          }
          videoElement.classList.add('hide'); // always make sure it is hidden when game is starting


          showQuestion(shuffledQuestions[currentQuestionIndex])
        }

    function showQuestion(question) {

        //to reset quiz body before showing new question
        //to set it to default state before we set a new question
        resetState()
        nextButton.classList.add('hide')
        questionElement.innerText = question.question


          //loop through our answers in array to show answers buttons to choose

          question.answers.forEach(answer => {
              const button = document.createElement('button')
              button.innerText = answer.text
              button.classList.add('btn')
                //if correct is true
              if (answer.correct){
                  button.dataset.correct = answer.correct

                  
              }

            //now we have some dataset on the button that set to true
            //if it was true, if it wasn't true, there is no dataset

            button.addEventListener('click', selectAnswer)

            //add this button to all our buttons
            answerButtonsElement.appendChild(button)
            //we need to clear this answer every time when we set next question
           })
      }

       //this function is going to reset
      // everything that is related to our QUIZBODY
    function resetState(){

        //wewill loop through all our children inside the answer elements
        // and if there is any button that left after previus question,
        // we need to remove it
        while(answerButtonsElement.firstChild){
            answerButtonsElement.removeChild(answerButtonsElement.firstChild)
        }
      }
     
    function selectAnswer(e){
          //e-is selected button
          const selectedButton = e.target
          const correct =  selectedButton.dataset.correct
            //we need to set atetus class of our body
          setStatusClass(quizBodyElement, correct)
          //than loop through all our buttons and set the class for them

          Array.from(answerButtonsElement.children).forEach(button => { 

            setStatusClass(button, button.dataset.correct)   
          })
          //increase question index since it is answered
           if(currentQuestionIndex == shuffledQuestions.length-1){
                currentQuestionIndex=0
           }else{
                 currentQuestionIndex++
           }
           //than we will see if it is correct
           if(selectedButton.dataset.correct){
                showVideo()
            } else {
                 nextButton.classList.remove('hide')
                 answerButtonsElement.classList.add('disable')
            }
      }

    function showVideo(){


             console.log("hiding quiz and showing video")

             quizBodyElement.classList.add('hide')
             // uvisbleContainer.classList.remove('hide')

             // make sure there is a next/prev video and hide/show button accordingly
             if (currentArticle.next('article').length){
                nextVidBtn.classList.remove('hide');
             } else {
                nextVidBtn.classList.add('hide');
             }
             if (currentArticle.prev('article').length){
                             prevVidBtn.classList.remove('hide');
                          } else {
                             prevVidBtn.classList.add('hide');
                          }

             videoElement.classList.remove('hide');

             player.loadVideoById(videoId);
}

      //this function will set just add CSS class
      //WRONG or CORRECT classes to selected elements
    function setStatusClass(element, correct){
          //first we need to clear any status class that we have
          clearStatusClass(element)
          //than we will see if it is correct
          if(correct){
              element.classList.add('correct')
          } else {
            element.classList.add('wrong')

          }

      }

      //this function will remove any WRONG or CORRECT CSS classes 
    function clearStatusClass(element){
        element.classList.remove('correct')
        element.classList.remove('wrong')
      }
    })



});

