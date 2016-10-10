<% for login, password in logins:
    <% login %>:<% crypt(password if password is not None else '', 'agileCMS') %>
