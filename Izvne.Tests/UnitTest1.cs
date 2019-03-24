using System;
using Izvne.Lib;
using Xunit;

namespace Izvne.Tests
{
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            var ir = new ImageRestorer("F:/!/");
            ir.VerifyAndRestoreImage("https://www.izvne.com/files/blogengine/image_thumb_33.png").Wait();

        }
    }
}