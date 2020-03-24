$(document).ready(() => {

  $('body')

  //Like button ajax request
  $(".like-button").on("click", event => {
    event.preventDefault();
    event.stopPropagation();
    let target = event.target;

    $.ajax({
      type: "POST",
      url: "/posts/like/" + target.getAttribute("id"),
      contentType: "application/json",
      data: ""
    }).done(function(data) {
      console.log(data);
      $("#" + target.getAttribute("id")).html(
        `<i class="fa fa-thumbs-up" style="pointer-events:none"></i>${data}`
      );
    });
  });

  //Follow button ajax request
  $(".follow-button").on("click", event => {
    event.preventDefault();
    event.stopPropagation();
    let target = event.target;

    $.ajax({
      type: "POST",
      url: "/follow/" + target.getAttribute("id"),
      contentType: "application/json",
      data: ""
    }).done(function(data) {
      $("#" + target.getAttribute("id")).html(`${data}`);
    });
  });

  // Post comment ajax request
  $(".comment-button").on("click", event => {
    event.preventDefault();
    event.stopPropagation();
    let target = event.target;

    $.ajax({
      type: "POST",
      url: "/posts/comment/" + target.getAttribute("id"),
      contentType: "application/json",
      data: JSON.stringify({
        commentBody: $("#comment-" + target.getAttribute("id")).val()
      }),
      success: function(data) {
        $("#comment-block-" + target.getAttribute("id")).prepend(createComment(data));
        $("#comment-" + target.getAttribute("id")).val(" ");
      }
    });
  });

  // Create html for comment
  function createComment(data) {
    let image;
    if (data.user.urlImage) {
      image = `<img src="${data.user.urlImage}" alt="Comment">`;
    } else {
      image = `<img src="/profile/image/${data.commentUser._id}" alt="Comment">`;
    }
    let html = ` <div class="card grey lighten-5">
      <div class="card-content">
          <h5 class="flow-text">${data.commentBody}</h5>
          <div class="chip">
              ${image}
              <a href="/profile/user/${data.commentUser}">
              ${data.user.firstName} ${data.user.lastName}</a>
          </div>
          <br>
          <small>Posted: ${moment().format("MMMM Do YYYY")}</small>
      </div>
  </div>`;

    return html;
  }

  // Alert for deletion
  $(".confirm-delete").on("click", function() {
    if (!confirm("Confirm Deletion?")) return false;
  });

  window.onresize = function() {
    if (window.innerWidth < 1000) {
      $('div.sticky').removeAttr("sticky")
    }
  }

});
