const moment = require("moment");

const truncate = (str, len) => {
  if (str.length > len && str.length > 0) {
    var new_str = str + " ";
    new_str = str.substr(0, len);
    new_str = str.substr(0, new_str.lastIndexOf(" "));
    new_str = new_str.length > 0 ? new_str : str.substr(0, len);
    return (new_str + "...").replace(/<(?:.|\n)*?>/gm, "");
  }
  return str;
};

const stripTags = input => {
  return input.replace(/<(?:.|\n)*?>/gm, "");
};

const formatDate = (date, format) => {
  return moment(date).format(format);
};

const select = (selected, options) => {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"')
    .replace(
      new RegExp(">" + selected + "</option>"),
      ' selected="selected" $&'
    );
};

const editIcon = (postUser, loggedUser, postId, floating = true) => {
  if (postUser === loggedUser) {
    if (floating) {
      return `<a href="/posts/edit/${postId}"
             class="btn-floating halfway-fab red"><i class="material-icons">edit</i></a>`;
    } else {
      return `<a class="btn red" href="/posts/edit/${postId}"><i class="material-icons">edit</i></a>`;
    }
  } else {
    return "";
  }
};

const editProfile = (profile, loggedUser, floating = true) => {
  if (profile === loggedUser) {
    if (floating) {
      return `<a href="/profile/edit"
             class="btn-floating halfway-fab red"><i class="material-icons">edit</i></a>`;
    } else {
      return `<a class="btn red" href="/profile/edit"><i class="material-icons">edit</i></a>`;
    }
  } else {
    return "";
  }
};

//Get follow status
const getStatus = (array, followUserId) => {
  let status = "Follow";
  
  for (let i = 0; i < array.length; i++) {
    if ("'" + array[i].followedUser  + "'" == "'" + followUserId  + "'" ) {
      status = "Following";
    }
  }
  return status;
};


//Show follow button depending on if it's logged in user's profile
const myProfile = (user, profileId, array) => {
  let loggedProfile;

  if (user.id == profileId) {
    loggedProfile = "";
  } else {
    loggedProfile = `<div class="card-action">
        <button class="btn red follow-button" id="${profileId}" type="submit">
        ${getStatus(array, profileId)}</button></div>`;
  }

  return loggedProfile;
};

module.exports = {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon,
  editProfile,
  getStatus,
  myProfile
};
