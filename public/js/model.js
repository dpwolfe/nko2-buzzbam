
var model =
{
  user: undefined,
  party: undefined,
  comments: [],
  orphanComments: [],
  items: [],
  friends: []
};

function modelUpdateTitle(title)
{
  model.party.title = title;
  viewModel.selectedParty().title(title);
  updateParty();
}

function modelUpdateWhen(when)
{
  model.party.when = when;
  viewModel.selectedParty().when(when);
  updateParty();
}

function modelUpdateWhere(where)
{
  model.party.where = where;
  viewModel.selectedParty().where(where);
  updateParty();
}

function modelUpdateDescription(description)
{
  model.party.description = description;
  viewModel.selectedParty().description(description);
  updateParty();
}

function modelSetFriends(friends)
{
  model.friends = friends;
  viewModel.friends(friends);
}

function modelSetUser(user)
{
  model.user = user;
  viewModel.user(user);
  viewModel.isLoggedIn(user.id ? true : false);
}

function modelSetParty(party)
{
  model.party = party;
  // make viewmodel calls

  viewModel.selectedParty().isPublic(party.public);
  viewModel.selectedParty().title(party.title);
  viewModel.selectedParty().description(party.description);
  viewModel.selectedParty().users(party.users);
  viewModel.selectedParty().where(party.where);
  viewModel.selectedParty().when(party.when);

  prepareChat(party._id, 0);
  prepareItems(party._id, 0);
  checkNewParty();
}

function getRevisionPrefix(rev)
{
  return parseInt(rev.split('-')[0]);
}

function checkNewParty()
{
  server.getParty(model.party._id, function(newParty) {
    newPrefix = getRevisionPrefix(newParty._rev);
    oldPrefix = getRevisionPrefix(model.party._rev);
    if (newPrefix > oldPrefix) {
      modelSetParty(newParty);
    }
    setTimeout(checkNewParty, 1500);
  });
}

function modelSetFriends(friends)
{
  viewModel.friends(friends);
}

function modelNewItem(newItem) {

  if (itemInModel(newItem)) {
    return; // dup
  }

  model.items.push(newItem);
  
  var viewItem = new itemInfo(newItem._id);
  viewItem.task(newItem.task);
  viewItem.done(newItem.done);
  viewItem.description(newItem.description);

  viewModel.items.push(viewItem);

  // load orphan comments if they arrived first
  var copy = model.orphanComments;
  model.orphanComments = [];
  for (var index in copy) {
    var orphan = copy[index];
    if (orphan.itemid == newItem._id) {
      viewItem.comments.push(orphan);
    }
    else {
      model.orphanComments.push(orphan);
    }
  }
}

function addCommentToItem(item, newComment)
{
  var comments = item.comments();
  for (var commentIndex in comments) {
    var existingComment = comments[commentIndex];
    if (existingComment.id == newComment.id) {
      return; // dup
    }
  }
  item.comments.push(newComment);
}

function itemInModel(newItem)
{
  for (var idx in model.items) {
    var existing = model.items[idx];
    if (existing._id === newItem._id) {
      return true;
    }
  }
  return false;
}

function commentInModel(newComment)
{
  for (var idx in model.comments) {
    var existing = model.comments[idx];
    if (existing._id === newComment._id) {
      return true;
    }
  }
  return false;
}

function findItemInfoForComment(newComment)
{
  var items = viewModel.items();
  for (var index in items) {
    var item = items[index];
    if (item.id == newComment.itemid) {
      return item;
    }
  }
  return null;
}

function modelNewComment(newComment) {

  if (model.party._id === newComment.partyid) {

    if (commentInModel(newComment)) {
      return; // dup
    }

    model.comments.push(newComment);

    if (newComment.itemid) {
      var itemInfo = findItemInfoForComment(newComment)
      if (itemInfo) {
        itemInfo.comments.push(newComment);
      }
      else {
        model.orphanComments.push(newComment);
      }
    }
    else {
      viewModel.chats.push(newComment);
    }
  }
}

