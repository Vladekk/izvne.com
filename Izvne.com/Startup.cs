using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Izvne.com
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            var options = new RewriteOptions()
                          //.AddRedirect("redirect-rule/(.*)", "redirected/$1")
                          .AddRewrite(@"^posts/(.+)$", "/posts/$1.html",
                                      false)
                          .AddRewrite(@"^pages/(.+)$", "/pages/$1.html",
                                      true);

//                          .AddRewrite(@"^lj/(.+)$", "/files/lj/$1",
//                                      true)
//                          .AddRewrite(@"^t/(.+)$", "/files/t/$1",
//                                      true)
//                          .AddRewrite(@"^u/(.+)$", "/files/u/$1",
//                                      true)
//                          .AddRewrite(@"image.axd\?picture=(.+)$", "/files/blogengine/$1",
//                                      true);
//            
            //.AddApacheModRewrite(apacheModRewriteStreamReader)
            //.AddIISUrlRewrite(iisUrlRewriteStreamReader)
            //.Add(MethodRules.RedirectXMLRequests)
            //.Add(new RedirectImageRequests(".png", "/png-images"))
            //.Add(new RedirectImageRequests(".jpg", "/jpg-images"));

            app.UseRewriter(options);

            app.UseDefaultFiles();

            app.UseStaticFiles();


//            app.UseMvc(routes =>
//            {
//                routes.MapRoute(
//                    name: "default",
//                    template: "{controller}/{action=Index}/{id?}");
//            });
        }
    }
}