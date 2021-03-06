function update_server_status()
{
	//$("div#rawjson_session").load("/server_status");
	$.getJSON("/server_status",function(resp)
	{
		// INI info
		$("h2#servername").text(resp["ini"]["name"]);
		$("span#currenttrack").text(resp["ini"]["track"]);
		$("span#currentcars").text(resp["ini"]["cars"]);
		$("span#maxusers").text(resp["ini"]["max_clients"]);
		$("div#rawjson_session").text(resp["ini"]["variant"]);
		// Server running or not
		if(resp["running"])
		{
			$("span#serverstatus").removeClass().addClass("online").text("Online");
		} else
		{
			$("span#serverstatus").removeClass().addClass("offline").text("Offline");
		}
		// Current session name
		$("span#serversession").text(resp["session"]["name"]);
		// Session time left
		if(resp["session"]["timeleft"] > 0)
		{
			var minutes = ~~(resp["session"]["timeleft"] / 60);
			var seconds = resp["session"]["timeleft"] % 60;
			var s = "";
			if(minutes < 10)
			{
				s = s + "0";
			}
			s = s + minutes + ":";
			if(seconds < 10)
			{
				s = s + "0";
			}
			s = s + seconds;
			$("span#timeleft").removeClass().text(s);
		} else
		{
			$("span#timeleft").removeClass().addClass("offline").text("00:00");
		}
		// Users online
		$("span#userson").text(resp["users_on"].join(", "));
		$("span#currentusers").text(resp["users_on"].length);
		// Session ranking
		$("tbody#sessionranking").html("");
		var i;
		for(i = 0;i < resp["session_ranking"].length;i++)
		{
			var entry = resp["session_ranking"][i];
			var bl_m = ~~(Math.floor(entry["best"])/60);
			var bl_s = Math.floor(entry["best"]) % 60;
			var bl_ms = ~~((entry["best"] - Math.floor(entry["best"])) * 1000);
			var best_lap = "";
			if(bl_m < 10)
			{
				best_lap = best_lap + "0";
			}
			best_lap = best_lap + bl_m + ":";
			if(bl_s < 10)
			{
				best_lap = best_lap + "0";
			}
			best_lap = best_lap + bl_s + "." + bl_ms;
			var tt_m = ~~(Math.floor(entry["total"])/60);
			var tt_s = Math.floor(entry["total"]) % 60;
			var tt_ms = ~~((entry["total"] - Math.floor(entry["total"])) * 1000);
			var total_time = "";
			if(tt_m < 10)
			{
				total_time = total_time + "0";
			}
			total_time = total_time + tt_m + ":";
			if(tt_s < 10)
			{
				total_time = total_time + "0";
			}
			total_time = total_time + tt_s + "." + tt_ms;
			$("tbody#sessionranking").append("<tr><td class=\"position\">" + (i+1) + "</td><td>" + entry["name"] + "</td><td>" + best_lap + "</td><td>" + total_time + "</td><td>" + entry["laps"] + "</td></tr>");
		}
		// Lap history
		$("tbody#laphistory").html("");
		for(i = 0;i < resp["laps"].length;i++)
		{
			var entry = resp["laps"][i];
			var l_m = ~~(Math.floor(entry[1])/60);
			var l_s = Math.floor(entry[1]) % 60;
			var l_ms = ~~((entry[1] - Math.floor(entry[1])) * 1000);
			var lap = "";
			if(l_m < 10)
			{
				lap = lap + "0";
			}
			lap = lap + l_m + ":";
			if(l_s < 10)
			{
				lap = lap + "0";
			}
			lap = lap + l_s + "." + l_ms;
			$("tbody#laphistory").append("<tr><td>" + entry[0] + "</td><td>" + lap + "</td></tr>");
		}
	});
}
function update_vote_status()
{
	//$("div#rawjson_voting").load("/vote_status");
	$.getJSON("/vote_status",function(resp)
	{
		if(resp["allowed"])
		{
			$("span#votingstatus").removeClass().addClass("online").text("OPEN");
		} else
		{
			$("span#votingstatus").removeClass().addClass("offline").text("CLOSED");
		}
		if(resp["in_progress"])
		{
			$("span#votetime").removeClass();
			if(resp["timeleft"] > 0)
			{
				var minutes = ~~(resp["timeleft"] / 60);
				var seconds = ~~(resp["timeleft"] % 60);
				var s = "";
				if(minutes < 10)
				{
					s = s + "0";
				}
				s = s + minutes + ":";
				if(seconds < 10)
				{
					s = s + "0";
				}
				s = s + seconds;
				$("span#votetimeleft").removeClass().text(s);
				if(minutes < 1)
				{
					$("span#votetimeleft").addClass("offline");
				}
			} else
			{
				$("span#votetimeleft").removeClass().addClass("offline").text("00:00");
			}
		} else
		{
			$("span#votetime").removeClass().addClass("invisible");
		}
		$.each(resp["sessions"],function(k,v)
		{
			$(".s_"+k).text(v);
		});
		$.each(resp["tracks"],function(k,v)
		{
			$(".t_"+k).text(v);
		});
		$.each(resp["cars"],function(k,v)
		{
			$(".c_"+k).text(v);
		});
	});
}
function send_vote(ev)
{
	var child = '';
	var li = '';
	var vote = {}
	if(ev.target.tagName != "LI")
	{
		li = $(ev.target).parents("li")[0];
	} else
	{
		li = ev.target;
	}
	child = $(li).find("input")[0];
	console.log(ev);
	console.log(child);
	vote[child.name] = child.value;
	$("li."+child.name).removeClass("selected");
	$(li).addClass("selected");
	console.log(vote);
	$.post('/vote',vote,update_vote_status);
}
$(document).ready(function()
{
	update_vote_status();
	update_server_status();
	setInterval(update_server_status,5000);
	setInterval(update_vote_status,5000);
	$("li").on("click",send_vote);
});