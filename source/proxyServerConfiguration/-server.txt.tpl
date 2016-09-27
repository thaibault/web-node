# region global
proxy_connect_timeout 1200s;
proxy_send_timeout    1200s;
proxy_read_timeout    1200s;
send_timeout          1200s;
proxy_set_header      Host "${host}";
proxy_set_header      X-Real-IP "${remote_addr}";
proxy_set_header      X-Forwarded-For "${proxy_add_x_forwarded_for}";
client_max_body_size  50M;
charset               <% options['encoding'].replace('_', '-') %>;
access_log            <% root.path %><% options['location']['proxyServerLog'][1:] %>;
# endregion
<% # region initialisation
<% for file in __file__.directory:
    <% if file.extension != TemplateParser.DEFAULT_FILE_EXTENSION:
        <% file.remove_file()
<% default_domain_name = ''
<% for domain in options['frontend']['domains']:
    <% if domain['default']:
        <% default_domain_name = domain['name']
        <% break
<% host_name_prefix = given_command_line_arguments.proxy_host_name_prefix
<% host_name_pattern = given_command_line_arguments.proxy_host_name_pattern
<% proxy_ports = given_command_line_arguments.proxy_ports
<% global_http_basic_authentication = \
    <% given_command_line_arguments.global_http_basic_authentication
<% if default_domain_name:
    <% fallback_default_domain_name = host_name_prefix + default_domain_name
    <% fallback_default_domain_pattern = StringExtension(
        <% host_name_prefix + default_domain_name
    <% ).regex_validated.content
<% elif options['frontend']['domains']:
    <% fallback_default_domain_name = host_name_prefix + \
        <% options['frontend']['domains'][0]['name']
    <% fallback_default_domain_pattern = StringExtension(
        <% host_name_prefix + options['frontend']['domains'][0]['name']
    <% ).regex_validated.content
<% else:
    <% # Default domain will refere to currently given domain because no
    <% # domain is currently active.
    <% fallback_default_domain_name = host_name_prefix + '${domain_name}'
    <% fallback_default_domain_pattern = StringExtension(
        <% host_name_prefix
    <% ).regex_validated.content + host_name_pattern
<% def determine_certificate_file(domain_pattern, regex=false):
    <% # Determine a valid certificate for given domain name or pattern.
    <% best_match = ''
    <% certificate_file = key_file = None
    <% for folder in FileHandler(options['location']['certificate']):
        <% if regex:
            <% pattern = domain_pattern.replace('(?<', '(?P<')
            <% match = RegularExpression(pattern).match(folder.name)
            <% if match:
                <% match = match.group()
            <% elif StringExtension(
                <% folder.name
            <% ).regex_validated.content in pattern:
                <% match = folder.name
            <% else:
                <% match = ''
        <% else:
            <% if domain_pattern.startswith(host_name_prefix):
                <% domain_pattern = domain_pattern[length(host_name_prefix):]
            <% # NOTE: We match only one subdomain level since a wildcard
            <% # domain only supports one sub domain level more than the
            <% # certificates root domain itself.
            <% match = RegularExpression('^(?:[^.]+\.)?%s$' % StringExtension(
                <% folder.name
            <% ).regex_validated.content).match(domain_pattern)
            <% match = match.group() if match else ''
        <% if length(best_match) < length(match):
            <% best_match = match
            <% longest_certificate_match = 0
            <% for file in folder:
                <% if(
                    <% file.extension in ['crt', 'pem'] and
                    <% longest_certificate_match < length(file.name)
                <% ):
                    <% certificate_file = file
                    <% longest_certificate_match = length(file.name)
                <% elif file.extension == 'key':
                    <% key_file = file
    <% return certificate_file, key_file
<% # endregion
<% for port in proxy_ports:
    # region <% port %>
    <% # Copy proxy server redirects for each port to let each redirect hanlder
    <% # remove it from the stack to avoid having redundant domain handling.
    <% domain_redirects = deepCopy(options.get('proxyServerRedirects', {}))
    <% # Handle all domains and provide a catch all default domain handler.
    <% for domain in options['frontend']['domains'] + ['default']:
        # region <% domain if domain == 'default' else domain['name'] %>
        <% # region external domain redirects wrapper
        <% # Redirects which doesn't match registered domains and ports will be
        <% # handled immediately before the catch all domain handler.
        <% none_empty_domain_redirects = filter(
            <% lambda redirect: redirect[1], domain_redirects.items())
        <% if domain == 'default' and none_empty_domain_redirects:
            # region external domain redirects
            # Remaining domain redirects have to be declared before the default
            # section which grabs everything since the ordering respects to
            # their priorities.
            <% for domain_pattern, redirects in none_empty_domain_redirects:
                <% if '#ports#' not in redirects:
                    <% redirects['#ports#'] = [port]
                <% # If there exist no domain (as default) we will integrate
                <% # remaining redirects with matching ports into the default
                <% # section. Check that we only handle domains which aren't in
                <% # the proxy port list.
                <% for redirect_port in filter(
                    <% lambda port: default_domain_name or length(
                        <% options['frontend']['domains']
                    <% ) or domain_pattern != '#default#' or port not in
                    <% proxy_ports, copy(redirects['#ports#'])
                <% ):
                    <% # Avoid having a redirect which shadows other registered
                    <% # domains. Only handle redirects which matches currently
                    <% # handled port.
                    <% if(
                        <% redirect_port not in proxy_ports or
                        <% port == redirect_port
                    <% ):
                        <% del redirects['#ports#'][redirects['#ports#'].index(
                            <% redirect_port)]
                        server {
                            <% certificate_file, key_file = \
                            <% determine_certificate_file(
                                <% domain_pattern=domain_pattern.replace(
                                    <% '#host_name_prefix#', ''
                                <% ).replace(
                                    <% '#default#',
                                    <% fallback_default_domain_pattern
                                <% ), regex=true)
                            listen <% redirect_port %><% ' ssl' if redirect_port == 443 and certificate_file and key_file else '' %>;
                            server_name ~(?<domain_name><% domain_pattern.replace('#host_name_prefix#', StringExtension(host_name_prefix).regex_validated.content).replace('#default#', fallback_default_domain_pattern) %>);
                            <% if(
                                <% redirect_port == 443 and
                                <% certificate_file and key_file
                            <% ):
                                # region certificate
                                ssl on;
                                ssl_certificate           <% certificate_file._path %>;
                                ssl_certificate_key       <% key_file._path %>;
                                ssl_session_timeout       5m;
                                ssl_protocols             SSLv3 TLSv1 TLSv1.1 TLSv1.2;
                                ssl_session_cache         shared:SSL:1m;
                                ssl_ciphers               "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
                                ssl_prefer_server_ciphers on;
                                # endregion
                            # region redirects
                            <% for source, target in redirects.items():
                                <% if source != '#ports#':
                                    location <% '' if source == '/' else '~ ' %>"<% source.replace('#host_name_prefix#', StringExtension(host_name_prefix).regex_validated.content).replace('#default#', StringExtension(fallback_default_domain_name).regex_validated.content) %>" {
                                        <% if isTypeOf(target, Dictionary):
                                            <% if target.keys()[0] == '#proxy#':
                                                proxy_pass "<% target.values()[0].replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                            <% else:
                                                <% for arguments, target in target.items():
                                                    <% if arguments and arguments[0] in ('?', '!'):
                                                        <% arguments = arguments[1:]
                                                    if ($args ~ "<% arguments %>") {
                                                        <% if isTypeOf(target, Dictionary):
                                                            proxy_pass "<% target.values()[0].replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                                        <% else:
                                                            return 301 "<% target.replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                                    }
                                                # Redirect to default domain.
                                                return 301 "${scheme}://<% fallback_default_domain_name %>${request_uri}";
                                        <% else:
                                            return 301 "<% target.replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                    }
                            # endregion
                        }
                <% # Remove redirects for currently handled port.
                <% domain_redirects[domain_pattern] = {}
            # endregion
        <% # endregion
        server {
            # region general
            # NOTE: This directive results in the variable "document_root"
            # which doesn't have a slash as suffix. So we avoid it here also.
            root                      <% root.path[:-1] %>;
            # endregion
            # region uniform resource locator
            <% if domain == 'default':
                <% if default_domain_name or options['frontend']['domains']:
                    <% certificate_file, key_file = determine_certificate_file(
                        <% domain_pattern=fallback_default_domain_name)
                <% else:
                    <% certificate_file, key_file = determine_certificate_file(
                        <% domain_pattern='localhost')
            <% else:
                <% certificate_file, key_file = determine_certificate_file(
                    <% domain_pattern=domain['name'])
            listen                    <% port %><% ' ssl' if port == 443 and certificate_file and key_file else '' %>;
            server_name               ~^(?<domain_name><% StringExtension(host_name_prefix).regex_validated.content %><% host_name_pattern if domain == 'default' else StringExtension(domain['name']).regex_validated.content %>)$;
            # Allow all domains to request resources from there http or https
            # pendant to avoid non necessary client side cross origin resource
            # sharing restrictions.
            add_header                Access-Control-Allow-Origin http<% 's' if port == 80 else '' %>://${domain_name};
            # endregion
            <% # region certificate wrapper
            <% if port == 443 and certificate_file and key_file:
                # region certificate
                ssl on;
                ssl_certificate           <% certificate_file._path %>;
                ssl_certificate_key       <% key_file._path %>;
                ssl_session_timeout       5m;
                ssl_protocols             SSLv3 TLSv1 TLSv1.1 TLSv1.2;
                ssl_session_cache         shared:SSL:1m;
                ssl_ciphers               "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
                ssl_prefer_server_ciphers on;
                # endregion
            <% # endregion
            <% # region http authentication wrapper
            <% logins = ()
            <% if(
                <% domain != 'default' and domain['login'] and
                <% domain['password'] or global_http_basic_authentication
            <% ):
                # region http authentication
                <% logins = (
                <%     global_http_basic_authentication and
                <%     global_http_basic_authentication[:global_http_basic_authentication.find(':')] or
                <%     domain['login'], global_http_basic_authentication and
                <%     global_http_basic_authentication[global_http_basic_authentication.find(':') + 1:] or
                <%     domain['password']),
                <% domain_configuration_file = FileHandler(
                <%     location='%s%s.txt' % (
                <%         options['location']['nginxConfiguration']['folder'],
                <%         domain if domain == 'default' else domain['name']))
                <% domain_configuration_file.content = TemplateParser(
                <%     template=options['location']['nginxConfiguration'][
                <%         'login']
                <% ).render(logins=logins).output
                auth_basic                "AgileCMS Authentication";
                auth_basic_user_file      <% domain_configuration_file._path %>;
                <% if not global_http_basic_authentication:
                    <% for other_domain in options['frontend']['domains']:
                        <% if(other_domain['default'] and
                        <% other_domain['name'] != domain['name'] and not (
                            <% other_domain['login'] or other_domain['password']
                        <% )):
                            # Handle redirect if user cancels authentication
                            # request.
                            error_page                401 "/401.html";
                            location = "/401.html" {
                                return 200 "<% options['httpBasicAuthenticationCancelRedirectHTMLContent'].format(url='${scheme}://' + host_name_prefix + other_domain['name'] + '${request_uri}').replace('"', '\\"') %>";
                            }
                            <% break
                # endregion
            <% # endregion
            # region mime types
            # NOTE: We have to add default mime types add the same level as we
            # add application specific one to avoid removing all default types.
            include                   mime.types;
            # Adding coffee script to known script files.
            types {
                application/javascript coffee;
            }
            # endregion
            <% for login, password in logins + (('', ''),):
                # region <% '' if login else 'no ' %>authentication prefix<% (' for login "' + login + '"') if login else '' %>
                ## region html5 manifest handling
                location = "<% ('/login:' + login + ':' + password) if login else '' %>/manifest.appcache" {
                    <% if login:
                        auth_basic   "off";
                    # NOTE: This is how we enforce html5 manifest file mime type.
                    types        {}
                    default_type text/cache-manifest;
                    add_header   Cache-Control no-cache;
                    try_files    "<% options['location']['webCache'] %>${domain_name}/generic.appcache" "/<% options['frontend']['requestFileName'] %>!__manifest__=on.appcache";
                }
                ## endregion
                ## region robots handling
                # Provides a dynamically generated "robots.txt" for search engines.
                location = "<% ('/login:' + login + ':' + password) if login else '' %>/robots.txt" {
                    <% if login:
                        auth_basic "off";
                    <% if domain == 'default' or not domain['crawlable']:
                        return 200 "User-agent: *\\nDisallow: /";
                    <% else:
                        <% disallowed_sites = '\\nDisallow: /__error_report__'
                        <% for site_url_suffix, site_properties in options['frontend'][
                            <% 'routes'
                        <% ][domain['id']].items():
                            <% if not site_properties['crawlable']:
                                <% disallowed_sites += (
                                    <% '\\nDisallow: ' + site_url_suffix)
                        return 200 "User-agent: *<% disallowed_sites %>";
                }
                ## endregion
                ## region static responses
                <% for url, response in options['staticResponse'].items():
                    <% # NOTE: Avoid authenticated urls if current url doesn't
                    <% # need any authentication.
                    <% if not (response.get('disableAuthentication', false) and login):
                        location = "<% ('/login:' + login + ':' + password) if login else '' %><% url %>" {
                            <% if response.get('disableAuthentication', false) or login:
                                auth_basic "off";
                            # NOTE: This is how we enforce specified mime type.
                            types      {}
                            default_type <% response.get('mime_type', 'text/html') %>;
                            return 200 "<% response.get('content', '') %>";
                        }
                ## endregion
                ## region client site error report handling
                location = "<% ('/login:' + login + ':' + password) if login else '' %>/__error_report__" {
                    <% if login:
                        auth_basic "off";
                    # NOTE: Client body saving only works if it will be forwarded
                    # if nginx acts as proxy server for this request.
                    client_body_temp_path "<% root.path %><% options['location']['reportedClientError'][1:] %>";
                    client_body_in_file_only on;
                    # Forward client error informations to application server.
                    if ($request_method = PUT) {
                        proxy_pass "http://127.0.0.1:<% given_command_line_arguments.port %>";
                        break;
                    }
                    return 301 "${scheme}://${domain_name}";
                }
                ## endregion
                <% ## region plugin specific site level server behavior
                <% pluginProxySiteConfiguration = callPluginStack(
                    <% data='', method_name='get_proxy_site_configuration',
                    <% arguments=(port, domain, __file__, login, password))
                <% if pluginProxySiteConfiguration:
                    ## region plugin specific site level server behavior
                    <% pluginProxySiteConfiguration.replace('\n', '\n    ').strip() %>
                    ## endregion
                <% ## endregion
                ## region internal redirects
                <% if not login:
                    # Redirect hash prefixed requests generally.
                    location ~ "^/--state-[^/]+--(?<real_url>/.+)$" {
                        # Authenticaten will be determined on redirected
                        # target.
                        auth_basic "off";
                        # We slice out hash prefix.
                        rewrite    "^.*$" "${real_url}";
                    }
                <% if not login or options['authenticateStaticAssets']:
                    # Redirect for static files which are associated with a plugin.
                    location ~ "^<% StringExtension((('/login:' + login + ':' + password) if login else '') + options['location']['plugin']['folder']).regex_validated.content %>[^/]+(<% StringExtension(options['location']['webAsset']).regex_validated.content %>|/)(?<web_asset_path>.+)$" {
                        <% if login:
                            auth_basic "off";
                        # We slice out the plugin specific part since all
                        # assets are linked into the global web asset folder.
                        rewrite    "^.*$" "<% options['location']['webAsset'] %>${web_asset_path}" break;
                    }
                    # Relatively referenced static files in admin section.
                    location ~ "^<% StringExtension(options['frontend']['userLoginURLSuffix'][:-1]).regex_validated.content %>(/.+)?<% StringExtension((('/login:' + login + ':' + password) if login else '') + options['location']['webAsset']).regex_validated.content %>(?<file_path>.+)$" {
                        <% if login:
                            auth_basic "off";
                        rewrite    "^.*$" "<% options['location']['webAsset'] %>${file_path}" break;
                    }
                    # No redirect for absolutely referenced static files.
                    location ^~ "<% ('/login:' + login + ':' + password) if login else '' %><% options['location']['webAsset'] %>" {
                        <% if login:
                            auth_basic "off";
                        expires    1y;
                        break;
                    }
                # Admin area with all client site pushed states.
                location ~ "^<% StringExtension((('/login:' + login + ':' + password) if login else '') + options['frontend']['userLoginURLSuffix'][:-1]).regex_validated.content %>(/.*|)$" {
                    <% if login:
                        auth_basic "off";
                    if ($args ~ "^.+$") {
                        # Slice unneeded old school formatted urls with
                        # parameter key value pairs.
                        return 301 "${scheme}://${domain_name}${uri}";
                    }
                    rewrite "^.*$" "<% options['location']['htmlFile']['backend'] %>" break;
                }
                <% if not (domain == 'default' and default_domain_name):
                    # Frontend requests with forced dynamic requests shouldn't
                    # be cached.
                    location ~ "^.*<% StringExtension((('/login:' + login + ':' + password) if login else '') + options['prerender']['forceDynamicResponseURLSuffix']).regex_validated.content %>$" {
                        <% if login:
                            auth_basic "off";
                        rewrite    "^.*$" "<% options['location']['htmlFile']['frontend'] %>" break;
                    }
                    <% # Try to find a default site.
                    <% default_url_suffix = None
                    <% if domain != 'default':
                        <% for url_suffix, site in filter(lambda site: site[1].get(
                            <% '_default'
                        <% ) == '' and site[0] != '',
                        <% options['frontend']['routes'][domain['id']].items()):
                            <% default_url_suffix = url_suffix
                    # Frontend with all client site pushed states.
                    location ~ "^<% StringExtension('/login:' + login + ':' + password).regex_validated.content if login else '' %>/?$" {
                        <% if login:
                            auth_basic "off";
                        if ($args ~ "^.+$") {
                            # Slice unneeded old school formatted urls with
                            # parameter key value pairs for internal handling.
                            rewrite "^/.+$" "${uri}";
                        }
                        # NOTE: This is how we enforce html mime type for html
                        # files with the empty string as file name.
                        types {}
                        default_type text/html;
                        # Cached and prerendered empty url suffix should be
                        # preferred.
                        if (-f "${document_root}<% options['location']['webCache'] %>${domain_name}/.html") {
                            rewrite "^/?$" "<% options['location']['webCache'] %>${domain_name}/.html" break;
                        }
                        <% if default_url_suffix:
                            # If no explicit url matching prerendered site exists
                            # try to find a default site prerendered version.
                            if (-f "${document_root}<% options['location']['webCache'] %>${domain_name}<% default_url_suffix %>.html") {
                                rewrite "^/.+$" "<% options['location']['webCache'] %>${domain_name}<% default_url_suffix %>.html" break;
                            }
                        # Render interactively as a last resort.
                        rewrite "^.*$" "<% options['location']['htmlFile']['frontend'] %>" break;
                    }
                ### region cgi backend
                location @proxy {
                    # Authentication was already handled before forwarding
                    # at to this context.
                    auth_basic "off";
                    proxy_pass "http://127.0.0.1:<% given_command_line_arguments.port %>";
                }
                # Dynamic requests.
                <% for location in (
                    <% '= "%s/%s"' % ((
                        <% '/login:' + login + ':' + password
                    <% ) if login else '',
                    <% options['frontend']['requestFileName']),
                    <% '~ "^%s/%s!(?<static_args>(__manifest__=on\\.appcache|(__cache__=(true|false)&)?(__flat__=(true|false)&)?(__method__=(delete|patch|put)&)?__model__=.+))$"' % ((
                        <% StringExtension(
                            <% '/login:' + login + ':' + password
                        <% ).regex_validated.content
                    <% ) if login else '', StringExtension(
                        <% options['frontend']['requestFileName']
                    <% ).regex_validated.content)
                <% ):
                    location <% location %> {
                        <% if login:
                            auth_basic "off";
                        <% if not location.startswith('~'):
                            # Check for invalid dynamic requests.
                            if ($args !~ "^(__manifest__=on\.appcache|(__cache__=(true|false)&)?(__flat__=(true|false)&)?(__method__=(delete|patch|put)&)?__model__=.+)$") {
                                # Delete invalid request parameter.
                                return 301 "${scheme}://${domain_name}";
                            }
                        if ($request_method != GET ) {
                            proxy_pass "http://127.0.0.1:<% given_command_line_arguments.port %>";
                        }
                        try_files "<% options['location']['webCache'] %>0-<% options['frontend']['requestFileName'] %>!${static_args}.json" "<% options['location']['webCache'] %>0-<% options['frontend']['requestFileName'] %>?${args}.json" @proxy;
                    }
                ### endregion
                <% if domain == 'default' and default_domain_name:
                    # Redirect frontend to default domain.
                    location <% ('/login:' + login + ':' + password) if login else '' %>/ {
                        <% if login:
                            auth_basic "off";
                        return 301 "${scheme}://<% host_name_prefix %><% default_domain_name %>${request_uri}";
                    }
                <% else:
                    # Full cached frontend requests.
                    location ~ "^<% StringExtension('/login:' + login + ':' + password).regex_validated.content if login else '' %>(?<url_suffix>/.+?)/?$" {
                        <% if login:
                            auth_basic "off";
                        # region external location redirects
                        <% # The default domain handler will grap all remaining
                        <% # redirects if they matchs currently handled port.
                        # NOTE: We have to inject our redirect here to ensure that
                        # the normal redirect rules take affect if nothing matches.
                        <% for domain_pattern, redirects in filter(lambda redirect: (
                            <% port in redirect[1].get('#ports#', (port,)) and (
                            <% domain == 'default' or ((
                                <% domain['default'] or not default_domain_name and
                                <% options['frontend']['domains'] and
                                <% options['frontend']['domains'][0] == domain
                            <% ) and redirect[0] == '#default#' or RegularExpression(
                                <% redirect[0].replace('(?<', '(?P<')
                            <% ).match(domain['name'])
                            <% ))), domain_redirects.items()
                        <% ):
                            <% for source, target in redirects.items():
                                <% if source == '#ports#':
                                    <% # Mark current port as handled.
                                    <% del redirects['#ports#'][redirects['#ports#'].index(port)]
                                <% elif isTypeOf(target, Dictionary):
                                    <% if target.keys()[0] == '#proxy#':
                                        if ($uri ~ "<% source.replace('#host_name_prefix#', StringExtension(host_name_prefix).regex_validated.content).replace('#default#', fallback_default_domain_pattern) %>") {
                                            proxy_pass "<% target.values()[0].replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                        }
                                    <% else:
                                        <% url_suffix = source.replace(
                                            <% '#host_name_prefix#',
                                            <% StringExtension(
                                                <% host_name_prefix
                                            <% ).regex_validated.content
                                        <% ).replace(
                                            <% '#default#',
                                            <% fallback_default_domain_pattern)
                                        <% if url_suffix.endswith('$'):
                                            <% url_suffix = url_suffix[:-1]
                                        <% for arguments, target in target.items():
                                            <% delimiter = r'\?'
                                            <% if arguments in ('', '^$'):
                                                <% delimiter = ''
                                            <% else:
                                                <% if arguments.startswith('?'):
                                                    <% delimiter += '?'
                                                <% arguments = arguments[1:]
                                            if ($request_uri ~ "<% url_suffix %><% delimiter %><% arguments[1:] if arguments.startswith('^') else arguments %>") {
                                                <% if isTypeOf(target, Dictionary):
                                                    proxy_pass "<% target.values()[0].replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                                <% else:
                                                    return 301 "<% target.replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                            }
                                <% else:
                                    if ($uri ~ "<% source.replace('#host_name_prefix#', StringExtension(host_name_prefix).regex_validated.content).replace('#default#', fallback_default_domain_pattern) %>") {
                                        return 301 "<% target.replace('#host_name_prefix#', host_name_prefix).replace('#default#', fallback_default_domain_name) %>";
                                    }
                            <% # Mark all redirects as handled for current port.
                            <% domain_redirects[domain_pattern] = {}
                        # endregion
                        if ($args ~ "^.+$") {
                            # Slice unneeded old school formatted urls with
                            # parameter key value pairs for internal handling.
                            rewrite "^/.+$" "${uri}";
                        }
                        # Cached and prerendered urls should be preferred.
                        if (-f "${document_root}<% options['location']['webCache'] %>${domain_name}${url_suffix}.html") {
                            rewrite "^/.+$" "<% options['location']['webCache'] %>${domain_name}${url_suffix}.html" break;
                        }
                        <% if default_url_suffix:
                            # If no explicit url matching prerendered site exists
                            # try to find a default site prerendered version.
                            if (-f "${document_root}<% options['location']['webCache'] %>${domain_name}<% default_url_suffix %>.html") {
                                rewrite "^/.+$" "<% options['location']['webCache'] %>${domain_name}<% default_url_suffix %>.html" break;
                            }
                        # NOTE: This is how we enforce html mime type for html
                        # files with the empty string as file name.
                        types {}
                        default_type text/html;
                        # If no explicit url matching prerendered site exists try
                        # to find a domain level prerendered version.
                        if (-f "${document_root}<% options['location']['webCache'] %>${domain_name}/.html") {
                            rewrite "^/.+$" "<% options['location']['webCache'] %>${domain_name}/.html" break;
                        }
                        # Render interactively as a last resort.
                        rewrite "^.*$" "<% options['location']['htmlFile']['frontend'] %>" break;
                    }
                ## endregion
                # endregion
        }
        <% # region www subdomain redirect wrapper
        <% if(
            <% domain != 'default' and domain['wwwRedirect'] and
            <% RegularExpression('www\..+\..+$').match(domain['name'])
        <% ):
            # region www subdomain redirect
            # Performs a redirect for incoming non www prefixed requests.
            server {
                # Redirect to the www prefixed pendant.
                listen      <% port %><% ' ssl' if port == 443 and certificate_file and key_file else '' %>;
                server_name <% host_name_prefix %><% domain['name'][length('www.'):] %>;
                return      301 "${scheme}://<% host_name_prefix %><% domain['name'] %>${request_uri}";
                <% if port == 443 and certificate_file and key_file:
                    # region certificate
                    ssl on;
                    ssl_certificate           <% certificate_file._path %>;
                    ssl_certificate_key       <% key_file._path %>;
                    ssl_session_timeout       5m;
                    ssl_protocols             SSLv3 TLSv1 TLSv1.1 TLSv1.2;
                    ssl_session_cache         shared:SSL:1m;
                    ssl_ciphers               "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
                    ssl_prefer_server_ciphers on;
                    # endregion
            }
            # endregion
        <% # endregion
        <% # region https to http or http to https redirect wrapper
        <% if port == 80 and 443 not in proxy_ports:
            # region https to http redirect
            # Performs a redirect for incoming encrypted requests to enforce
            # non encrypted connections.
            server {
                listen      443<% ' ssl' if certificate_file.is_file() and key_file.is_file() else '' %>;
                server_name ~^(?<domain_name><% StringExtension(host_name_prefix).regex_validated.content %><% host_name_pattern if domain == 'default' else StringExtension(domain['name']).regex_validated.content %>)$;
                return      301 "http://${domain_name}${request_uri}";
                <% if certificate_file and key_file:
                    # region certificate
                    ssl on;
                    ssl_certificate           <% certificate_file._path %>;
                    ssl_certificate_key       <% key_file._path %>;
                    ssl_session_timeout       5m;
                    ssl_protocols             SSLv3 TLSv1 TLSv1.1 TLSv1.2;
                    ssl_session_cache         shared:SSL:1m;
                    ssl_ciphers               "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
                    ssl_prefer_server_ciphers on;
                    # endregion
            }
            # endregion
        <% elif port == 443 and 80 not in proxy_ports:
            # region http to https redirect
            # Performs a redirect for incoming non encrypted requests to enforce
            # encrypted connections.
            server {
                listen      80;
                server_name ~^(?<domain_name><% StringExtension(host_name_prefix).regex_validated.content %><% host_name_pattern if domain == 'default' else StringExtension(domain['name']).regex_validated.content %>)$;
                return      301 "https://${domain_name}${request_uri}";
            }
            # endregion
        <% # endregion
        # endregion
    # endregion
<% # region modline
<% # vim: set tabstop=4 shiftwidth=4 expandtab:
<% # vim: foldmethod=marker foldmarker=region,endregion:
<% # endregion
