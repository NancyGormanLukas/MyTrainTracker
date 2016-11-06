//on ready function wrapped around jQuery
$(document).on('ready', function(){

	// Firebase link
	var dataRef = new Firebase("https://adambay.firebaseio.com/");
	// Initial Values
	var authData = dataRef.getAuth();
	
	if(authData !== null){ //checks to see if client is authenticated

		//hide login-button and show logout-button if client is authenticated
		$("#login-button").addClass('hide').removeClass('show');
		$("#logout-button").addClass('show').removeClass('hide');

	}

	var keyId = "";
	var keyId2 = "";
	var keyVal = "";
	var trainName = "";
	var destination = "";
	var start = "";
	var frequency = 0;
	var startConverted = "";
	var diffTime = "";
	var tRemainder = "";
	var tilTrain = "";
	var nextTrain = "";
	//update function called continuously via setInterval below
	var update = function(){
		$('#trainData > tbody').empty(); //table body with train data is cleared
		$('#trainData > thead > tr').empty(); //table head row is also cleared incase loggedIn state changes
		var authData = dataRef.getAuth();
		if(authData !== null){ //checks to see if client is authenticated

			//table head is populated with initial values plus edit and remove column titles
			$('#trainData > thead > tr').append("<th>" + 
				"Train Name" + "</th><th>" + 
				"Destination" + "</th><th>" + 
				"Frequency (min)" + "</th><th>" + 
				"Next Arrival" + "</th><th>" + 
				"Minutes Away" + "</th><th>" + 
				"Remove Train" + "</th><th>" + 
				"Edit Train" + "</th>");
			//queries firebase for each child in database and returns the values
			dataRef.on("child_added", function(snapshot){

				//set variable as train start time in military time format
				startConverted = moment(snapshot.val().start,"HH:mm");
				console.log(startConverted);

				//set diffTime as the difference between the current time and start time in minutes
				diffTime = moment().diff(startConverted, "minutes");
				console.log(diffTime);

				//returns the division remainder of diffTime and train frequency
				tRemainder = diffTime % snapshot.val().frequency;
				console.log(tRemainder);

				//figures time until next train by subtracting frequency from tRemainder variable
		    tilTrain = snapshot.val().frequency - tRemainder;
		    console.log(tilTrain);

		    //sets nextTrain arrival in minutes
		    nextTrain = moment().add(tilTrain, "minutes");
		    console.log(nextTrain);
		   	
		   	//table body values are populated with firebase snapshot values and train times converted above
		   	//since logged in, there is also an edit and remove button added for each train
		    $('#trainData > tbody').append("<tr><td>" + 
		    	snapshot.val().trainName + "</td><td>" + 
		    	snapshot.val().destination + "</td><td>" + 
		    	snapshot.val().frequency + "</td><td>" + 
		    	nextTrain.format("HH:mm") + "</td><td>" + 
		    	//remove and edit buttons have a data-id attribute with the value of the corresponding firebase key to target the correct child in database
		    	//edit button has a data-key attribute containing the entire snapshot of the child values
		    	//edit button triggers a modal and uses the data-key attribute to populate the modal inputs with the current firebase values
		    	tilTrain + "</td><td><button class=" + "remove" + " data-id=" + snapshot.key() + ">Remove</button></td><td><button class=" + "edit" + " data-toggle=" + "modal" + " data-target=" + "#myModal" + " data-key=" + JSON.stringify(snapshot.val()) + " data-id=" + snapshot.key() + ">Edit</button></td></tr>");
			})
		}else{ //runs if loggedIn variable is set to false
			$('#trainData > thead > tr').append("<th>" + 
				"Train Name" + "</th><th>" + 
				"Destination" + "</th><th>" + 
				"Frequency (min)" + "</th><th>" + 
				"Next Arrival" + "</th><th>" + 
				"Minutes Away" + "</th>");
			//queries firebase for each child in database and returns the values
			dataRef.on("child_added", function(snapshot){
			
				//set variable as train start time in military time format
				startConverted = moment(snapshot.val().start,"HH:mm");
				console.log(startConverted);

				//set diffTime as the difference between the current time and start time in minutes
				diffTime = moment().diff(startConverted, "minutes");
				console.log(diffTime);

				//returns the division remainder of diffTime and train frequency
				tRemainder = diffTime % snapshot.val().frequency;
				console.log(tRemainder);

				//figures time until next train by subtracting frequency from tRemainder variable
		    tilTrain = snapshot.val().frequency - tRemainder;
		    console.log(tilTrain);

		    //sets nextTrain arrival in minutes
		    nextTrain = moment().add(tilTrain, "minutes");
		    console.log(nextTrain);
		   	
		   	//table body values are populated with firebase snapshot values and train times converted above
		    $('#trainData > tbody').append("<tr data-id=" + 
		    	snapshot.key() + "><td>" + 
		    	snapshot.val().trainName + "</td><td>" + 
		    	snapshot.val().destination + "</td><td>" + 
		    	snapshot.val().frequency + "</td><td>" + 
		    	nextTrain.format("HH:mm") + "</td><td>" + 
		    	tilTrain + "</td></tr>");
			})
		}
		
	};

	//calls update function when document is ready
	//it is most useful when setInterval is long enough to delay initial table data population
	update(); //<---calling update function here is not 100% necessary
  setInterval(update, 1000); //calls update function every second to calculate train times

	//Listens for Add Train Submit Button Click
  $("#submitTrain").on("click", function() {

  	//retrieve values from input fields and trims leading white space
    trainName = $('#trainName').val().trim();
    destination = $('#destination').val().trim();
    start = $('#start').val().trim();
    frequency = $('#frequency').val().trim();

    //pushes new train to firebase as a new child
    dataRef.push({
        'trainName': trainName,
        'destination': destination,
        'start': start,
        'frequency': frequency,
    });

    //reset text field to placeholder value
		$("#trainName , #destination , #start , #frequency").val('');

    // Don't refresh the page!
    return false;
  });

  //Listens for SignUp Button Click
  $(".signBtn").on("click", function() {

  	//Shows or hides the SignUp Panel by toggling the hide and show class
  	$("#signUp").toggleClass('hide show');

  });

  //Listens for Login Button Click
  $(".loginBtn").on("click", function() {

  	//Shows or hides the Login Panel by toggling the hide and show class
  	$("#login").toggleClass('hide show');

  });

  //Listens for Remove Train Button Click
  $(document).on('click', '.remove', function(){

  	//Grabs firebase child key stored in the button's data-id attribute
  	keyId = $(this).attr('data-id');
  	console.log(keyId);
  	//Removes child with corresponding key from firebase
  	dataRef.child(keyId).remove();

  });

  //Listens for Edit Train Button Click
  $(document).on('click', '.edit', function(){

  	//Grabs firebase child values stored as a string in the button's data-key attribute
  	keyVal = $(this).attr('data-key');
  	//Grabs firebase child key stored in the button's data-id attribute
  	keyId2 = $(this).attr('data-id');
  	console.log(keyVal);
  	console.log(keyId2);
  	//Converts keyVal string to an object
  	keyValNew = JSON.parse(keyVal);
  	//Populate each edit modal input field by accessing the converted object
  	$('#modName').val(keyValNew.trainName);
  	$('#modDestination').val(keyValNew.destination);
  	$('#modStart').val(keyValNew.start);
  	$('#modFrequency').val(keyValNew.frequency);

  });

  //Listens for Edit Train SUBMIT Button Click
  $(document).on('click', '#submitMod', function() {

  	//retrieve values from EDIT modal input fields and trims leading white space
    trainName = $('#modName').val().trim();
    destination = $('#modDestination').val().trim();
    start = $('#modStart').val().trim();
    frequency = $('#modFrequency').val().trim();

    //Updates the child in firebase with new values
    dataRef.child(keyId2).update({
        'trainName': trainName,
        'destination': destination,
        'start': start,
        'frequency': frequency,
    });

    //reset text field to placeholder
		$("#modName , #modDestination , #modStart , #modFrequency").val('');

    // Don't refresh the page!
    return false;
  });

  //Listens for SignUp Submit Button Click
  $("#signSubmit").on("click", function() {

  	//retrieve values from input fields and trims leading white space
  	var signEmail = $('#signEmail').val().trim();
  	var signPass = $('#signPass').val().trim();

  	//Creates a new user in Firebase with submitted credentials
	  dataRef.createUser({
	  email    : signEmail,
	  password : signPass
			}, function(error, userData) {
			  if (error) {
			    console.log("Error creating user:", error);
			  } else {
			    console.log("Successfully created user account with uid:", userData.uid);
			    //Hide SignUp Panel
			    $("#signUp").toggleClass('hide show');
			  }
			});
	  // Don't refresh the page!
    return false;
  });

  //Listens for Login Submit Button Click
  $("#loginSubmit").on("click", function() {

  	//retrieve values from input fields and trims leading white space
  	var loginEmail = $('#loginEmail').val().trim();
  	var loginPass = $('#loginPass').val().trim();

  	//Checks Firebase users against submitted login credentials
	  dataRef.authWithPassword({
	  email    : loginEmail,
	  password : loginPass
			}, function(error, authData) {
			  if (error) {
			    console.log("Login Failed!", error);
			  } else {
			    console.log("Authenticated successfully with payload:", authData);
			    remember: "sessionOnly" //User is only logged in for the life of the page
			    //Hide the Login Panel, Login Button and show Logout Button after successful login
			    $("#login, #logout-button, #login-button").toggleClass('hide show');
			  }
		});
	  // Don't refresh the page!
    return false;
  });

  //Listens for Logout Button Click
  $("#logout-button").on("click", function() {

  	// Unauthenticate the client
		dataRef.unauth();
		// Hide Logout button and show Login button
		$("#logout-button, #login-button").toggleClass('hide show');

  });

});