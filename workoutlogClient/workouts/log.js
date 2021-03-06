$(function(){
	$.extend(WorkoutLog, {
		log: {
			workouts: [],

			setDefinitions: function(type){
				var defs = WorkoutLog.definition.userDefinitions;
				var len = defs.length;
				var opts;
				for (var i = 0; i < len; i++){
					opts += "<option value ='" + defs[i].id + "'>" + defs[i].description + "</option>";
				}
				$("#" + type + "-definition").children().remove();
				$("#" + type + "-definition").append(opts);
			},
			setHistory: function(){
				var history = WorkoutLog.log.workouts;
				var len = history.length;
				var lis = "";
				for (var i = 0; i < len; i++){
					lis += "<li class='list-group-item'>" + 
					history[i].def + " - " + 
					history[i].result + " " + 
					"<div class='pull-right'>" + 
						"<button id='" + history[i].id + "' class='update'><strong>Edit</strong></button>" + 
						"<button id='" + history[i].id + "' class='remove'><strong>Delete</strong></button>" + 
					"</div></li>";
				}

				$("#history-list").children().remove();
				$("#history-list").append(lis);
			},
			create: function(){
				var itsLog = {
					desc: $("#log-description").val(),
					result: $("#log-result").val(),
					def: $("#log-definition option:selected").text()
				};
				var postData = {log: itsLog};
				var logger = $.ajax({
					type: "POST",
					url: WorkoutLog.API_BASE + "log",
					data: JSON.stringify(postData),
					contentType: "application/json"
				});
				logger.done(function(data){
					WorkoutLog.log.workouts.push(data);
					$("#log-description").val("");
					$("#log-result").val("");
					$('a[href="#history"]').tab("show");
				});
			},
			getWorkout: function(){
				var thisLog = {id: $(this).attr("id")};
				console.log(thisLog);
				logID = thisLog.id;
				var updateData = {log: thisLog};
				var getLog = $.ajax({
					type: "GET",
					url: WorkoutLog.API_BASE + "log/" + logID,
					data: JSON.stringify(updateData),
					contentType: "application/json"
				});
				getLog.done(function(data){
					$('a[href="#update-log"]').tab("show");
					$("#update-result").val(data.result);
					$("#update-description").val(data.description);
					$("#update-id").val(data.id);
				});
			},
			updateWorkout: function(){
				$("#update").text("Update");
				var updateLog = {
					id: $("#update-id").val(),
					desc: $("#update-description").val(),
						result: $("#update-result").val(),
						def: $("#update-definition option:selected").text()
				}
				for (var i = 0; i < WorkoutLog.log.workouts.length; i++){
					if (WorkoutLog.log.workouts[i].id == updateLog.id){
						WorkoutLog.log.workouts.splice(i, 1, updateLog);
					}
				}
				WorkoutLog.log.workouts.push(updateLog);
				var updateLogData = {log: updateLog};
				var updater = $.ajax({
					type: "PUT",
					url: WorkoutLog.API_BASE + "log",
					data: JSON.stringify(updateLogData),
					contentType: "application/json"
				});
				updater.done(function(data){
				$("#update-description").val("");
				$("#update-result").val("");
				$('a[href="#history"]').tab("show");
				console.log('click')
				})

			},


			delete: function(){
				var thisLog = {
					//In the below line of code....
					//(this) is the button on the li (li = login), and....
					//.attr("id") targets the value of the id attribute of button.
					id: $(this).attr("id") //An object must first be created for this to work (created above), so the db
																	//can go through and target the id of that object.
				};
				var deleteData = {log: thisLog};
				var deleteLog = $.ajax({
					type: "DELETE",
					url: WorkoutLog.API_BASE + "log",
					data: JSON.stringify(deleteData),
					contentType: "application/json"
				});
				/*Removes list item*/
				/*References button then grabs closet li*/
				$(this).closest("li").remove();

				/*Deletes item out of workouts array*/
				for (i = 0; i < WorkoutLog.log.workouts.length; i++){
					if (WorkoutLog.log.workouts[i].id == thisLog.id){
						WorkoutLog.log.workouts.splice(i, 1);
					}
				}
				deleteLog.fail(function(){
					console.log("Nope, you didn't delete it.")
				});
			},
			fetchAll: function(){
				var fetchDefs = $.ajax({
					type: "GET",
					url: WorkoutLog.API_BASE + "log",
					headers: {
						"authorization":
							window.localStorage.getItem("sessionToken")
					}
				})
				.done(function(data){
					WorkoutLog.log.workouts = data;
				})
				.fail(function(err){
					console.log(err);
				});
			}
		}
	})

	/*Click the button and create a log entry*/
	$("#log-save").on("click", WorkoutLog.log.create);
	$("#history-list").delegate(".remove", "click", WorkoutLog.log.delete);	//.delegate has the same "click" event as .on,
														//as well as a function (on the above line - WorkoutLog.log.delete). 
													//It also has an extra parameter, that comes first. It is always a class
													//So if you have three arguements/parameters, always use .delegate over
													//.on       .... delegate is coded as:
													//	.delegate(selector, eventType, handler)

	$("#log-update").on("click", WorkoutLog.log.updateWorkout); //jQuery. (id or class of what you want to delete). 
	$("#history-list").delegate(".update", "click", WorkoutLog.log.getWorkout);

	if (window.localStorage.getItem("sessionToken")){
		WorkoutLog.log.fetchAll();
	}
});