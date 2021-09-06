
 $(document).ready(function(){

    //******** load iFrame YouTube player API and construct the video player ************

    // 1. Create a script tag with src= to youtube api to load the api script
    var tag = document.createElement("script");
    tag.id = "iframe-script";
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(tag, firstScript);


    // 2. construct the player
    var player;
    window.onYouTubeIframeAPIReady = function () {

        player = new YT.Player('player', {

            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
        });
    }

    // 3. Define the the event functions
    window.onPlayerReady = function (event) {

        console.log("player is ready");
    }

    window.onPlayerStateChange = function (event) {
        let e = event.data;
        console.log("player status is: " + e);

    }





    //********** define function to load the videos on the page given a youtube api URL (search or playlists) and options
    function loadVids(URL, options){

        // make sure to the quiz window
        $("#quiz-body").hide();

        // Also make sure to hide and pause the video if it was already playing
        // $("#video").hide();
        try {// if player is not constructed yet skip this

            if (player.getPlayerState()==1){
                player.pauseVideo();
            }

        } catch (e){(console.log("player did not load yet"));}



        // Empty previous videos if needed
        $("#videos").empty()

        $.getJSON(URL, options, function(data){
             console.log("youtube data api success.");

             // loop through the items and load them on the page
             $.each(data.items, function(i, item){

                 var thumb = item.snippet.thumbnails.medium.url;
                 var title=item.snippet.title;
                 var desc = item.snippet.description.substring(0, 100);

                 // the search api and playlist api returns the data with videoId in different path
                 // we check first if we are using the search api (URL ending in 'h') or playlistsitems api (URL ends in 's')
                 if(URL.charAt(URL.length - 1) == 's') {
                    var vid=item.snippet.resourceId.videoId; // path for playlistitems api's videoId
                 } else if(URL.charAt(URL.length - 1) == 'h') {
                    var vid=item.id.videoId; // path for search api videoId
                 }

                 console.log(item)



                 $('#videos').append(`
                     <article class="item" data-key="${vid}">
                         <img src="${thumb}"
                         alt="Image of ${title}"  class="thumb" />
                         <div class="details">

                             <h4>${title}</h4>
                             
                             <p>${desc}</p>
                         </div>
                     </article>
                 `);
             });

        });
    }

    //****** YouTube data api variables for loading a playlist and pass to loadVids function****************//

    var API_KEY="AIzaSyAEHX8Fv1RLEWVKWFzzk7QlB-2mb1RsvVo"; // used for both search and playlistitems api

    var playlistId = 'PLcHIy7MhWjmgA2YfyLc9kQpYOENBB9X_y';
    var URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
    var options = {
         part: 'snippet',
         key: API_KEY,
         maxResults: 20,
         playlistId: playlistId,

    }

    loadVids(URL, options);


    //******* SEARCH VIDEOS, event handlet for form submission
    $("#form").submit(function(event){
        event.preventDefault()

        // get the value to search
        var search=$("#search").val()
        //set up youtube api search variables
        URL = 'https://www.googleapis.com/youtube/v3/search';
        options = {
             part: 'snippet',
             key: API_KEY,
             type: 'video',
             maxResults: 20,
             q: search,
        }
        // pass them into the loadvids function
        loadVids(URL, options);
    });



    //************ load the quiz questions.json and shuffle ********
    var shuffledQuestions;
    $.getJSON ("questions.json", function (data){
        let questions = data;
        shuffledQuestions = questions.sort(() => Math.random() - .5);
        console.log("json loaded");
    });
    let currentQuestionIndex = 0;

    //***** set up event handlers ********

    //first declare video related global variables
    var currentArticle; // will hold the <article> element containing video details
    var videoId;

    // Event handler: Main
     // When user selects a video to play
    $('#videos').on('click', 'article', function (){
        console.log("CLICKE")

        //save the <article> and id of the video clicked in variable to play the video after quiz is answered
        currentArticle = $(this);
        videoId = currentArticle.attr('data-key')

    



        //********** start the quiz game function which lead to playing the video
        startGame();
    });

    // Event Handler: quiz controls
    // next and close buttons
    $('#cancel-btn').on('click', () => {
        $('#quiz-body').hide();
    })
    $('#next-btn').on('click', () => {

        showQuestion(shuffledQuestions[currentQuestionIndex]);
    })

    // Event handler: Answer Buttons
    // for user choosing an answer to let user know if correct and proceed accordingly
    $('#answer-buttons').on('click','button',function (e){
        console.log("answer selected");

        //1. get the data kay "correct" from selected button
        let selectedButton = $(this);
        let correct =  selectedButton.data('correct'); // returns the value stored (true/false) for data key "correct"

        //2. increase question index to next question, or if this was last, back to zero
        if(currentQuestionIndex == shuffledQuestions.length-1){
            currentQuestionIndex=0
        }else{
            currentQuestionIndex++
        }

        //3. Check if user answered correctly and show video or show the next button so user can try again
        if(correct){
            showVideo()
        } else {

            // 1. Show the user the correct and wrong answers
            $('#answer-buttons button').each(function(){
                if ($(this).data('correct')){
                    $(this).addClass('correct');
                } else {
                    $(this).addClass('wrong');
                }
            });

            // 2. disable the answers so user cannot click again
            $('#answer-buttons').addClass('disable');

            // 3. change the quiz background to red for WRONG!!
            $('#quiz-body').addClass('wrong');
            // 4. show the next button
            $('#next-btn').show();

        }
    });

    // Event Handler: Video Controls
    // selects next/prev video <article> by using jquery.next()/prev(), and close button to hide video
    $('#prev-video-btn').on('click',function () {
        currentArticle = currentArticle.prev('article');
        videoId = currentArticle.attr('data-key');

        startGame ();
    });
    $('#next-video-btn').on('click',function() {

        currentArticle = currentArticle.next('article');
        videoId = currentArticle.attr('data-key');

        startGame ();
    });
    $('#close-video-btn').on('click', function() {
        // Make sure to stop the video if it is playing
        if (player.getPlayerState()==1 ){ // 1 means playing
        player.pauseVideo();
        }
        $("#video").hide();
    });



    // ***** funtion that start the quiz
    function startGame(){

        // 1. Make sure to hide and pause the video if it is playing
        if (player.getPlayerState()==1){ // 1 means playing
        player.pauseVideo();

        }
        // $('#video').hide();


        // 2. show quiz body and show current index's question
        $('#quiz-body').show();
        showQuestion(shuffledQuestions[currentQuestionIndex])
    }

    // ***** show question function that display and sets up the quiz body
    function showQuestion(questionObj) {

        //1. Remove ALL previous correct and wrong CSS classes
        $('.correct').removeClass('correct');
        $('.wrong').removeClass('wrong');

        // 2. Write the question
        $('#question').text(questionObj.question);


        // 3. Answers Buttons:
        // a. loop through our answers in the questions Object
        $.each(questionObj.answers,function (index, answer){
            // b. add dataset to identify which button is correct or not
            answerBtn= $('#answer'+index);
            answerBtn.text(answer.text);
            answerBtn.data('correct',answer.correct); // store true or false for key "correct"

        });
        // c. Remove previous disable CSS class if present
        $('#answer-buttons').removeClass('disable');

        // 3. Hide the next button to prevent user from skipping the question
        $("#next-btn").hide();

    }


    //**** this function will play the selected video and set up video controls. Executes if user answers answers
    // the quiz correctly
    function showVideo(){

        // 1. hide the quiz body
        $('#quiz-body').hide();

         // 2. make sure there is a next/prev video and hide/show buttons accordingly
         if (currentArticle.next('article').length){
            $('#next-video-btn').show();
         } else {
            $('#next-video-btn').hide();
         }
         if (currentArticle.prev('article').length){
             $('#prev-video-btn').show();
         } else {
             $('#prev-video-btn').hide();
         }

         // show and play video!
         $('#video').show();

         player.loadVideoById(videoId);
    }




});

