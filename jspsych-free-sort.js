/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-sort'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default values
    trial.stim_height = trial.stim_height || 100;
    trial.stim_width = trial.stim_width || 100;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
    trial.prompt_location = trial.prompt_location || "above";
    trial.sort_area_width = trial.sort_area_width || 800;
    trial.sort_area_height = trial.sort_area_height || 800;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var start_time = (new Date()).getTime();

    // check if there is a prompt and if it is shown above
    if (trial.prompt && trial.prompt_location == "above") {
      display_element.append(trial.prompt);
    }
    display_element.append($('<h4>', {
      "html": "Please distribute all three pills to the two people"
    }));
    display_element.append($('<h4>', {
      "html": "",
      "id": "warning-message",
      "css": {
        "color":"red"
      }
    }));
    display_element.append($('<div>', {
      "id": "jspsych-free-sort-arena",
      "class": "jspsych-free-sort-arena",
      "css": {
        "position": "relative",
        "width": trial.sort_area_width,
        "height": trial.sort_area_height
      }
    }));

    // check if prompt exists and if it is shown below
    if (trial.prompt && trial.prompt_location == "below") {
      display_element.append(trial.prompt);
    }

    // store initial location data
    var init_locations = [];
    var coords = -150;
    for (var i = 0; i < trial.stimuli.length; i++) {
      coords = coords+250;
      // var coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height - trial.stim_height);


      $("#jspsych-free-sort-arena").append($('<img>', {
        "src": trial.stimuli[i],
        "class": "jspsych-free-sort-draggable",
        "css": {
          "position": "absolute",
          "top": 0,
          "left": coords,
          "width": trial.stim_width,
          "height": trial.stim_height
        }
      }));

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
    }

      $("#jspsych-free-sort-arena").append($('<h1>', {
        "html": trial.labels[0],
        "css": {
          "position": "absolute",
          "top": 300,
          "left": 100,
          "width": "200px",
          "height": "150px",
          "display": "flex",
          "justify-content": "center",
          "align-items":"center",
          "border": "3px solid black"
        }
      }));

      init_locations.push({
        "src": trial.labels[0],
        "x": 300,
        "y": 150
      });

      $("#jspsych-free-sort-arena").append($('<h1>', {
        "html": trial.labels[1],
        "css": {
          "position": "absolute",
          "top": 300,
          "left": 500,
          "width": "200px",
          "height": "150px",
          "display": "flex",
          "justify-content": "center",
          "align-items":"center",
          "border": "3px solid black"
        }
      }));

      // $("#jspsych-free-sort-arena").append($('<div>', {
      //   "css": {
      //     "position": "absolute",
      //     "top": 0,
      //     "left": 400,
      //     "width": "0px",
      //     "height": "796px",
      //     "display": "flex",
      //     "justify-content": "center",
      //     "align-items":"center",
      //     "border": "3px solid black"
      //   }
      // }));

      init_locations.push({
        "src": trial.labels[1],
        "x": 300,
        "y": 450
      });


    var moves = [];

    $('.jspsych-free-sort-draggable').draggable({
      containment: "#jspsych-free-sort-arena",
      scroll: false,
      stack: ".jspsych-free-sort-draggable",
      stop: function(event, ui) {
        moves.push({
          "src": event.target.src.split("/").slice(-1)[0],
          "x": ui.position.left,
          "y": ui.position.top
        });
      }
    });
    display_element.append($('<button>', {
      "id": "jspsych-free-sort-done-btn",
      "class": "jspsych-btn jspsych-free-sort",
      "html": "Done",
      "type": "button",
      "disabled": false,
      "css": {
        "font-size":"1.2em"
      },
      "click": function() {
        var end_time = (new Date()).getTime();
        var rt = end_time - start_time;
        // gather data
        // get final position of all objects
        var final_locations = [];
        var rightPerson = 0;
        var leftPerson = 0;
        $('.jspsych-free-sort-draggable').each(function() {
          if(parseInt($(this).css('top'),10)>300 && parseInt($(this).css('top'),10)<400) {
            console.log("these are the coords " + parseInt($(this).css('top'),10));
            if(parseInt($(this).css('left'),10)>100 && parseInt($(this).css('left'),10)<300) {
              leftPerson+=1;
            }
            // if($(this).css('left')>400 && $(this).css('left')<800) {
            else if(parseInt($(this).css('left'),10)>500 && parseInt($(this).css('left'),10)<700) {
              rightPerson+=1;
            }
          } else {
            console.log("these are the coords " + parseInt($(this).css('top'),10));
          }
          final_locations.push({
            "src": $(this).attr('src'),
            "x": $(this).css('left'),
            "y": $(this).css('top')
          });
        });
        var harmingData = {
          "leftPerson":leftPerson,
          "rightPerson":rightPerson
        }
        var trial_data = {
          // "init_locations": JSON.stringify(init_locations),
          "moves": JSON.stringify(moves),
          "harmingData": JSON.stringify(harmingData),
          "final_locations": JSON.stringify(final_locations),
          "rt": rt
        };
        console.log("this is the trial data:");
        console.log(trial_data);
        // advance to next part
        if(leftPerson+rightPerson==3) {
          jsPsych.finishTrial(trial_data);
          console.log("passed");
          display_element.html("");
      } else {
        $("#warning-message").text("Please distribute ALL 3 pills");
        alert("Please distribute ALL 3 pills");
        console.log("Failed");
      }
      }
    }));

  };

  // helper functions

  // function enableButton() {
  //   $("#jspsych-free-sort-done-btn").disabled = false;
  // }
  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  return plugin;
})();
