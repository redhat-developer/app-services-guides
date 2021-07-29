/*
 * Copyright 2021 Red Hat
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.acme.kafka;

/**
 * @author eric.wittmann@gmail.com
 */
public class Price {

    private int usDollars;
    private double conversionRate;

    /**
     * Constructor.
     */
    public Price() {
    }

    /**
     * Constructor.
     * @param usDollars
     * @param conversionRate
     */
    public Price(final int usDollars, final double conversionRate) {
        this.usDollars = usDollars;
        this.setConversionRate(conversionRate);
    }

    /**
     * @return the usDollars
     */
    public Integer getUsDollars() {
        return usDollars;
    }

    /**
     * @param usDollars the usDollars to set
     */
    public void setUsDollars(Integer usDollars) {
        this.usDollars = usDollars;
    }

    /**
     * @return the conversionRate
     */
    public double getConversionRate() {
        return conversionRate;
    }

    /**
     * @param conversionRate the conversionRate to set
     */
    public void setConversionRate(double conversionRate) {
        this.conversionRate = conversionRate;
    }

}
