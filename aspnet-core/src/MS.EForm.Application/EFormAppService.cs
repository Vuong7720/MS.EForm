using System;
using System.Collections.Generic;
using System.Text;
using MS.EForm.Localization;
using Volo.Abp.Application.Services;

namespace MS.EForm;

/* Inherit your application services from this class.
 */
public abstract class EFormAppService : ApplicationService
{
    protected EFormAppService()
    {
        LocalizationResource = typeof(EFormResource);
    }
}
