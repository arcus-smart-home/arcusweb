# Use Debian Wheezy as the base installation
FROM nginx

RUN rm /etc/nginx/conf.d/default.conf

COPY run-nginx /usr/bin
RUN chmod +x /usr/bin/run-nginx
RUN mkdir /usr/share/nginx/html/.well-known

COPY default.conf /etc/nginx/conf.d/default.conf
ADD  build/static /usr/share/nginx/html
ADD  build/static/index.html /usr/share/nginx/html/index.html


CMD [ "/usr/bin/run-nginx" ]

